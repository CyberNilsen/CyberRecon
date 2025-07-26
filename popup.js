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
                    <button class="copy-btn" data-copy="${escapeHtml(currentData.ip.ip)}">📋 Copy IP</button>
                </div>
                <div class="result-content">
                    <div class="result-row">
                        <span class="result-label">IP Address:</span>
                        <span class="result-value">${escapeHtml(currentData.ip.ip || 'Unknown')}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Location:</span>
                        <span class="result-value">${escapeHtml((currentData.ip.city || 'Unknown') + ', ' + (currentData.ip.country || 'Unknown'))}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">ISP/Org:</span>
                        <span class="result-value">${escapeHtml(currentData.ip.isp || 'Unknown')}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">ASN:</span>
                        <span class="result-value">${escapeHtml(currentData.ip.asn || 'Unknown')}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Timezone:</span>
                        <span class="result-value">${escapeHtml(currentData.ip.timezone || 'Unknown')}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Coordinates:</span>
                        <span class="result-value">${escapeHtml((currentData.ip.latitude || 'N/A') + ', ' + (currentData.ip.longitude || 'N/A'))}</span>
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
                    <button class="copy-btn" data-copy="${escapeHtml(currentData.domain.name)}">📋 Copy Domain</button>
                </div>
                <div class="result-content">
                    <div class="result-row">
                        <span class="result-label">Domain:</span>
                        <span class="result-value">${escapeHtml(currentData.domain.name)}</span>
                    </div>
                    <div class="result-row">
                        <span class="result-label">Resolves to:</span>
                        <span class="result-value">${escapeHtml(currentData.domain.ip || 'Failed to resolve')}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    document.getElementById('results').innerHTML = html || '<p style="text-align: center; opacity: 0.7;">No results to display</p>';
    
    attachCopyButtonListeners();
}

function displayDNSResults() {
    let html = `
        <div class="result-section">
            <div class="result-title">
                📝 DNS Records for ${escapeHtml(currentData.target)}
                <button class="copy-btn" data-copy-dns="all">📋 Copy All</button>
            </div>
            <div class="result-content">
    `;
    
    if (Object.keys(currentData.dns).length === 0) {
        html += '<p>No DNS records found</p>';
    } else {
        for (const [type, records] of Object.entries(currentData.dns)) {
            if (records && records.length > 0) {
                html += `<div class="result-row">
                    <span class="result-label">${escapeHtml(type)}:</span>
                    <span class="result-value">${escapeHtml(records.map(r => r.data).join(', '))}</span>
                </div>`;
            }
        }
    }
    
    html += '</div></div>';
    document.getElementById('results').innerHTML = html;
    
    attachCopyButtonListeners();
}

function attachCopyButtonListeners() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', handleCopyClick);
    });
}

function handleCopyClick(event) {
    const button = event.target;
    const copyText = button.getAttribute('data-copy');
    const copyDns = button.getAttribute('data-copy-dns');
    
    if (copyDns === 'all') {
        copyAllDNS(button);
    } else if (copyText) {
        copyToClipboard(copyText, button);
    }
}

async function sendMessage(message) {
    return new Promise((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage(message, resolve);
        } else {
            console.log('Chrome APIs not available, simulating response');
            resolve({ success: false, error: 'Chrome APIs not available' });
        }
    });
}

function showMessage(message, type) {
    const resultsDiv = document.getElementById('results');
    let className = type || '';
    
    if (type === 'loading') {
        resultsDiv.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    } else {
        resultsDiv.innerHTML = `<div class="${className}">${escapeHtml(message)}</div>`;
    }
}

function clearResults() {
    document.getElementById('results').innerHTML = '<p style="text-align: center; opacity: 0.7;">Enter a domain or IP address to begin reconnaissance</p>';
    document.getElementById('targetInput').value = '';
    currentData = {};
}

async function copyToClipboard(text, buttonElement = null) {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showCopySuccess(buttonElement, text);
            return;
        }
        
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            showCopySuccess(buttonElement, text);
        } else {
            throw new Error('Copy command failed');
        }
    } catch (error) {
        console.error('Copy failed:', error);
        showCopyError();
    }
}

function copyAllDNS(buttonElement = null) {
    let text = `DNS Records for ${currentData.target}:\n\n`;
    for (const [type, records] of Object.entries(currentData.dns)) {
        if (records && records.length > 0) {
            text += `${type}: ${records.map(r => r.data).join(', ')}\n`;
        }
    }
    copyToClipboard(text, buttonElement);
}

function showCopySuccess(buttonElement, copiedText) {

    if (buttonElement) {
        buttonElement.classList.add('copied');
        setTimeout(() => {
            buttonElement.classList.remove('copied');
        }, 2000);
    }
    
    const feedback = document.getElementById('copyFeedback');
    const message = document.getElementById('copyMessage');
    
    let displayText = 'Copied to clipboard!';
    if (copiedText) {
        if (copiedText.includes('\n')) {
            displayText = '📋 DNS records copied!';
        } else if (copiedText.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
            displayText = '📋 IP address copied!';
        } else {
            displayText = '📋 Domain copied!';
        }
    }
    
    message.textContent = displayText;
    feedback.classList.add('show');
    
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 3000);
}

function showCopyError() {
    const feedback = document.getElementById('copyFeedback');
    const message = document.getElementById('copyMessage');
    
    message.textContent = '❌ Copy failed!';
    feedback.style.background = 'rgba(231, 76, 60, 0.95)';
    feedback.classList.add('show');
    
    setTimeout(() => {
        feedback.classList.remove('show');
        feedback.style.background = 'rgba(46, 204, 113, 0.95)';
    }, 3000);
}

function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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