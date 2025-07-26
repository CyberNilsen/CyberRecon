console.log('CyberRecon loaded');

let currentData = {};

async function getCurrentTab() {
    showMessage('Getting current tab domain...', 'loading');
    
    try {
        const response = await sendMessage({action: 'getCurrentTab'});
        
        if (response && response.success) {
            document.getElementById('targetInput').value = response.hostname;
            showMessage('Ready to analyze: ' + response.hostname, 'success');
        } else {
            showMessage('Could not access current tab', 'error');
        }
    } catch (error) {
        showMessage('Failed to get current tab', 'error');
    }
}

async function getMyIP() {
    showMessage('Detecting your public IP...', 'loading');
    
    try {
        const response = await sendMessage({
            action: 'fetchData', 
            url: 'https://ipapi.co/json/'
        });
        
        if (response && response.success && response.data.ip) {
            document.getElementById('targetInput').value = response.data.ip;
            showMessage('Your public IP: ' + response.data.ip, 'success');
        } else {
            showMessage('Could not detect your IP', 'error');
        }
    } catch (error) {
        showMessage('IP detection failed', 'error');
    }
}

async function lookupInfo() {
    const target = document.getElementById('targetInput').value.trim();
    if (!target) {
        showMessage('Please enter a domain or IP address', 'error');
        return;
    }
    
    showMessage('Analyzing ' + target + '...', 'loading');
    currentData = { target };
    
    try {
        const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(target);
        
        if (isIP) {
            await lookupIP(target);
        } else {
            await lookupDomain(target);
        }
        
        displayResults();
    } catch (error) {
        showMessage('Analysis failed: ' + error.message, 'error');
    }
}

async function lookupIP(ip) {
    const apis = [
        {
            url: 'https://ipapi.co/' + ip + '/json/',
            name: 'ipapi.co'
        },
        {
            url: 'http://ip-api.com/json/' + ip,
            name: 'ip-api.com'
        }
    ];
    
    for (const api of apis) {
        try {
            const response = await sendMessage({action: 'fetchData', url: api.url});
            
            if (response && response.success && response.data && !response.data.error) {
                const data = response.data;
                currentData.ip = {
                    ip: data.ip || data.query,
                    city: data.city,
                    region: data.region || data.regionName,
                    country: data.country_name || data.country,
                    countryCode: data.country_code || data.countryCode,
                    timezone: data.timezone,
                    isp: data.org || data.isp,
                    asn: data.asn || data.as,
                    latitude: data.latitude || data.lat,
                    longitude: data.longitude || data.lon,
                    source: api.name
                };
                return;
            }
        } catch (error) {
            console.log(`${api.name} failed:`, error);
        }
    }
    
    throw new Error('All IP lookup services failed');
}

async function lookupDomain(domain) {
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    currentData.domain = { name: domain };
    
    try {
        const dnsResponse = await sendMessage({
            action: 'fetchData', 
            url: 'https://dns.google/resolve?name=' + domain + '&type=A'
        });
        
        if (dnsResponse && dnsResponse.success && dnsResponse.data.Answer) {
            const ip = dnsResponse.data.Answer[0].data;
            currentData.domain.ip = ip;
            
            await lookupIP(ip);
        } else {
            throw new Error('Domain could not be resolved');
        }
    } catch (error) {
        currentData.domain.error = 'DNS resolution failed';
        throw error;
    }
}

async function getDNSRecords() {
    const target = document.getElementById('targetInput').value.trim();
    if (!target) {
        showMessage('Please enter a domain', 'error');
        return;
    }
    
    const domain = target.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    showMessage('Fetching DNS records for ' + domain + '...', 'loading');
    
    try {
        const recordTypes = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME'];
        currentData = { target: domain, dns: {} };
        
        const promises = recordTypes.map(async (type) => {
            try {
                const response = await sendMessage({
                    action: 'fetchData',
                    url: `https://dns.google/resolve?name=${domain}&type=${type}`
                });
                
                if (response && response.success && response.data.Answer) {
                    currentData.dns[type] = response.data.Answer.map(record => ({
                        data: record.data,
                        ttl: record.TTL
                    }));
                }
            } catch (error) {
                console.log(`DNS ${type} lookup failed:`, error);
            }
        });
        
        await Promise.all(promises);
        displayDNSResults();
        
    } catch (error) {
        showMessage('DNS lookup failed: ' + error.message, 'error');
    }
}

function displayResults() {
    let html = '';
    
    if (currentData.ip) {
        html += `
            <div class="result-section">
                <div class="result-title">
                    🌐 IP Geolocation
                    <button class="copy-btn" onclick="copyToClipboard('${currentData.ip.ip}')">📋 Copy IP</button>
                </div>
                <div class="result-content">
                    <div class="result-row">
                        <span class="result-label">IP Address:</span>
                        <span class="result-value">${currentData.ip.ip || 'Unknown'}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Location:</span>
                        <span class="result-value">${(currentData.ip.city || 'Unknown')}, ${currentData.ip.country || 'Unknown'}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">ISP/Org:</span>
                        <span class="result-value">${currentData.ip.isp || 'Unknown'}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">ASN:</span>
                        <span class="result-value">${currentData.ip.asn || 'Unknown'}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Timezone:</span>
                        <span class="result-value">${currentData.ip.timezone || 'Unknown'}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Coordinates:</span>
                        <span class="result-value">${currentData.ip.latitude || 'N/A'}, ${currentData.ip.longitude || 'N/A'}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (currentData.domain) {
        html += `
            <div class="result-section">
                <div class="result-title">
                    🏷️ Domain Analysis
                    <button class="copy-btn" onclick="copyToClipboard('${currentData.domain.name}')">📋 Copy Domain</button>
                </div>
                <div class="result-content">
                    <div class="result-row">
                        <span class="result-label">Domain:</span>
                        <span class="result-value">${currentData.domain.name}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Resolves to:</span>
                        <span class="result-value">${currentData.domain.ip || 'Failed to resolve'}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('results').innerHTML = html || '<p style="text-align: center; opacity: 0.7;">No results to display</p>';
}

function displayDNSResults() {
    let html = `
        <div class="result-section">
            <div class="result-title">
                📝 DNS Records for ${currentData.target}
                <button class="copy-btn" onclick="copyAllDNS()">📋 Copy All</button>
            </div>
            <div class="result-content">
    `;
    
    if (Object.keys(currentData.dns).length === 0) {
        html += '<p>No DNS records found</p>';
    } else {
        for (const [type, records] of Object.entries(currentData.dns)) {
            if (records && records.length > 0) {
                html += `<div class="result-row">
                    <span class="result-label">${type}:</span>
                    <span class="result-value">${records.map(r => r.data).join(', ')}</span>
                </div>`;
            }
        }
    }
    
    html += '</div></div>';
    document.getElementById('results').innerHTML = html;
}

async function sendMessage(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, resolve);
    });
}

function showMessage(message, type) {
    const resultsDiv = document.getElementById('results');
    let className = type || '';
    
    if (type === 'loading') {
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `<div class="${className}">${message}</div>`;
    }
}

function clearResults() {
    document.getElementById('results').innerHTML = '<p style="text-align: center; opacity: 0.7;">Enter a domain or IP address to begin reconnaissance</p>';
    document.getElementById('targetInput').value = '';
    currentData = {};
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showCopyFeedback();
    } catch (error) {
        console.error('Copy failed:', error);
    }
}

function copyAllDNS() {
    let text = `DNS Records for ${currentData.target}:\n\n`;
    for (const [type, records] of Object.entries(currentData.dns)) {
        if (records && records.length > 0) {
            text += `${type}: ${records.map(r => r.data).join(', ')}\n`;
        }
    }
    copyToClipboard(text);
}

function showCopyFeedback() {
    const feedback = document.getElementById('copyFeedback');
    feedback.classList.add('show');
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('lookupBtn').addEventListener('click', lookupInfo);
    document.getElementById('tabBtn').addEventListener('click', getCurrentTab);
    document.getElementById('ipBtn').addEventListener('click', getMyIP);
    document.getElementById('dnsBtn').addEventListener('click', getDNSRecords);
    document.getElementById('clearBtn').addEventListener('click', clearResults);
    
    document.getElementById('targetInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            lookupInfo();
        }
    });
    
    getCurrentTab();
});