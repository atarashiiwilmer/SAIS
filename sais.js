class SAIS {
    constructor() {
        this.input = document.getElementById('input');
        this.output = document.getElementById('output');
        this.summaryContent = document.getElementById('summaryContent');
        this.copyButton = document.getElementById('copyButton');
        this.clearButton = document.getElementById('clearBtn');
        this.logButton = document.getElementById('logBtn');
        this.status = document.getElementById('status');
        this.steps = Array.from({length: 4}, (_, i) => document.getElementById(`step${i+1}`));
        this.workTab = document.getElementById('workTab');
        this.statsTab = document.getElementById('statsTab');
        this.tabButtons = document.querySelectorAll('.tab');
        this.tipsList = document.getElementById('tipsList');
        this.outputCard = document.getElementById('outputCard');
        this.outputCover = document.getElementById('outputCover');
        this.outputContent = document.getElementById('outputContent');
        this.loggedData = [];
        
        this.initEventListeners();
        this.updateTips();
    }


    initEventListeners() {
        this.input.addEventListener('input', () => this.processInput());
        this.copyButton.addEventListener('click', () => this.copyOutput());
        this.clearButton.addEventListener('click', () => this.clearInput());
        this.logButton.addEventListener('click', () => this.logOutput());
        this.tabButtons.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
    }

    processInput() {
        const inputText = this.input.value;
        this.updateSteps(inputText);
        this.updateTips();
    }

    updateSteps(inputText) {
        const stepContents = [
            this.getInitialAssessment(inputText),
            this.getRelevantFindings(inputText),
            this.getClaimDecision(inputText),
            this.getSpecificAction(inputText)
        ];
        
        const initialRequirements = [
            "Scenario, Duplicate claim, Merchant credit, Customer withdrew claim, Pre Review Claim Status",
            "Dispute reason, 60 Day Liability, Greater than two years, Elderly abuse, FPF indicator, Customer since, Open Date, YTD, NSF, Date of Birth, Claims filed in 12mos",
            "Claim Decision",
            "Specific Action"
        ];

        this.steps.forEach((step, index) => {
            const content = stepContents[index];
            let guide = step.querySelector('.step-guide');
            if (!guide) {
                guide = document.createElement('div');
                guide.className = 'step-guide';
                step.appendChild(guide);
            }
            
            if (!guide.hasAttribute('data-requirements')) {
                guide.setAttribute('data-requirements', initialRequirements[index]);
            }
            
            const requirements = guide.getAttribute('data-requirements').split(', ');
            
            if (content) {
                const remainingRequirements = requirements.filter(req => !content.includes(req.split(':')[0]));
                guide.textContent = 'Required: ' + remainingRequirements.join(', ');
                step.innerHTML = content + guide.outerHTML;
                this.animateStep(step, true);
            } else {
                guide.textContent = 'Required: ' + requirements.join(', ');
                step.innerHTML = guide.outerHTML;
                this.animateStep(step, false);
            }
        });

        const completedSteps = stepContents.filter(content => content !== '').length;
        
        if (completedSteps === 4) {
            this.generateOutput(stepContents);
            this.addStep5();
        } else {
            this.summaryContent.innerHTML = '';
            this.copyButton.disabled = true;
            this.updateStatus(`Processing Step ${completedSteps} of 4. Keep refining your input! 🔍`);
            this.removeStep5();
            this.lockOutput();
        }
    }

    animateStep(step, isCompleted) {
        if (isCompleted) {
            step.classList.add('completed');
        } else {
            step.classList.remove('completed');
        }
    }
    getInitialAssessment(inputText) {
        const match = inputText.match(/Scenario: (.+)/i);
        const scenario = match ? match[1] : '';
        const duplicateClaim = inputText.includes('Duplicate claim: Y') ? 'Y' : 'N';
        const merchantCredit = inputText.includes('Merchant credit: Y') ? 'Y' : 'N';
        const customerWithdrew = inputText.includes('Customer withdrew claim: Y') ? 'Y' : 'N';
        const statusMatch = inputText.match(/Pre Review Claim Status: (.+)/i);
        const status = statusMatch ? statusMatch[1] : '';

        if (scenario && status) {
            return `
                <p>Claim set up as ${scenario}</p>
                <p>Duplicate claim: ${duplicateClaim}</p>
                <p>Merchant credit: ${merchantCredit}</p>
                <p>Customer withdrew claim: ${customerWithdrew}</p>
                <p>Pre Review Claim Status: ${status}</p>
            `;
        }
        return '';
    }

    getRelevantFindings(inputText) {
        const match = inputText.match(/Customer called in to dispute transaction\(s\) as (.+)/i);
        const scenario = match ? match[1] : '';
        const liability = inputText.includes('60 Day Liability: Y') ? 'Y' : 'N';
        const twoYears = inputText.includes('Greater than two years: Y') ? 'Y' : 'N';
        const elderlyAbuse = inputText.includes('Elderly abuse: Y') ? 'Y' : 'N';
        const fpfIndicator = inputText.includes('FPF indicator: Y') ? 'Y' : 'N';

        const customerSince = inputText.match(/Customer since\s*:\s*(\S+)/i);
        const openDate = inputText.match(/Open Date\s*:\s*(\S+)/i);
        const ytd = inputText.match(/YTD\s*:\s*(\S+)/i);
        const nsf = inputText.match(/NSF\s*:\s*(\S+)/i);
        const dob = inputText.match(/Date of Birth\s*:\s*(\S+)/i);
        const claimsFiled = inputText.match(/Claims filed in 12mos\s*:\s*(\S+)/i);

        if (scenario) {
            return `
                <p>Customer called in to dispute transaction(s) as ${scenario}</p>
                <p>60 Day Liability: ${liability}</p>
                <p>Greater than two years: ${twoYears}</p>
                <p>Elderly abuse: ${elderlyAbuse}</p>
                <p>FPF indicator: ${fpfIndicator}</p>
                <p>Customer since: ${customerSince ? customerSince[1] : ''}</p>
                <p>Open Date: ${openDate ? openDate[1] : ''}</p>
                <p>YTD: ${ytd ? ytd[1] : ''}</p>
                <p>NSF: ${nsf ? nsf[1] : ''}</p>
                <p>Date of Birth: ${dob ? dob[1] : ''}</p>
                <p>Claims filed in 12mos: ${claimsFiled ? claimsFiled[1] : ''}</p>
            `;
        }
        return '';
    }

    getClaimDecision(inputText) {
        const match = inputText.match(/Claim Decision:(.+)/i);
        if (match) {
            return `<p>${match[1].trim()}</p>`;
        }
        return '';
    }

    getSpecificAction(inputText) {
        const match = inputText.match(/Specific Action:(.+)/i);
        if (match) {
            return `<p>${match[1].trim()}</p>`;
        }
        return '';
    }

    generateOutput(stepContents) {
        let summaryHTML = `
            <h4>Step 1: Initial Assessment</h4>
            ${stepContents[0]}
            <h4>Step 2: Relevant Findings in Research</h4>
            ${stepContents[1]}
            <h4>Step 3: Claim Decision</h4>
            ${stepContents[2]}
            <h4>Step 4: Specific Action Taken to Resolve Claim</h4>
            ${stepContents[3]}
        `;

        this.summaryContent.innerHTML = summaryHTML;
        this.copyButton.disabled = false;
        this.updateStatus('Analysis complete! Insights ready for exploration. 🎓');
        this.unlockOutput();
    }
    addStep5() {
        let step5 = document.getElementById('step5');
        if (!step5) {
            step5 = document.createElement('div');
            step5.className = 'step';
            step5.id = 'step5';
            document.querySelector('.step-container').appendChild(step5);
        }
        step5.innerHTML = `
            <div class="step-header">Step 5: Next Steps in Claim Review Process</div>
            <div class="step-content">
                <button class="btn" id="closeClaimBtn">Claim will now be closed</button>
                <button class="btn" id="finalizeClaimBtn">Claim will be finalized on or before FRD</button>
            </div>
        `;
        
        document.getElementById('closeClaimBtn').addEventListener('click', () => this.finalizeStep5('Claim will now be closed.'));
        document.getElementById('finalizeClaimBtn').addEventListener('click', () => this.finalizeStep5('Claim will be finalized on or before FRD.'));
    }

    finalizeStep5(decision) {
        const existingStep5 = Array.from(this.summaryContent.querySelectorAll('h4')).find(h4 => h4.textContent.includes('Step 5'));
        if (existingStep5) {
            existingStep5.nextElementSibling.textContent = decision;
        } else {
            this.summaryContent.innerHTML += `
                <h4>Step 5: Next Steps in Claim Review Process</h4>
                <p>${decision}</p>
            `;
        }
        this.updateStatus('All steps completed. You can now copy the output.');
        // Disable the buttons in Step 5
        const step5Buttons = document.querySelectorAll('#step5 button');
        step5Buttons.forEach(button => button.disabled = true);
    }

    removeStep5() {
        const step5 = document.getElementById('step5');
        if (step5) {
            step5.remove();
        }
    }

    copyOutput() {
        const outputText = this.summaryContent.innerText;
        navigator.clipboard.writeText(outputText).then(() => {
            this.updateStatus('Result copied to clipboard! 📋');
        });
    }

    clearInput() {
        this.input.value = '';
        this.steps.forEach(step => {
            const guide = step.querySelector('.step-guide');
            step.innerHTML = guide.outerHTML;
            step.classList.remove('completed');
        });
        this.summaryContent.innerHTML = '';
        this.copyButton.disabled = true;
        this.removeStep5();
        this.lockOutput();
        this.updateStatus('Input cleared. Ready for new analysis! 🚀');
        this.updateTips();
    }

    logOutput() {
        if (this.summaryContent.innerText) {
            const entry = {
                info: this.summaryContent.innerText,
                date: new Date().toLocaleString()
            };
            this.loggedData.push(entry);
            this.updateStatsTab();
            this.updateStatus('Output logged successfully! 📊');
        }
    }

    updateStatsTab() {
        const tableHTML = `
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Info</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.loggedData.map(entry => `
                        <tr>
                            <td>${entry.info}</td>
                            <td>${entry.date}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        this.statsTab.innerHTML = tableHTML;
    }
    switchTab(tabName) {
        if (tabName === 'work') {
            this.workTab.style.display = 'block';
            this.statsTab.style.display = 'none';
        } else {
            this.workTab.style.display = 'none';
            this.statsTab.style.display = 'block';
        }
        this.tabButtons.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
    }

    updateStatus(message) {
        this.status.textContent = message;
    }

    updateTips() {
        const tips = [
            "Enter claim details for a comprehensive analysis.",
            "Include customer information for better context.",
            "Mention any special circumstances or considerations."
        ];
        this.tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
    }

    lockOutput() {
        this.outputCard.classList.remove('unlocked');
        this.outputCover.style.display = 'block';
        this.outputContent.style.display = 'none';
    }

    unlockOutput() {
        this.outputCard.classList.add('unlocked');
        this.outputCover.style.display = 'none';
        this.outputContent.style.display = 'block';
    }
}

// Initialize SAIS
document.addEventListener('DOMContentLoaded', () => {
    const sais = new SAIS();
});
	
