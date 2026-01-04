// Landing Plans - Dynamic Plan Loading
// Make sure config.js is loaded first to have API_URL available

(async function() {
    'use strict';

    const API_URL = window.API_URL || 'http://localhost/ESTOX/api';

    /**
     * Format price to Brazilian Real format
     * @param {number|string} price - The price to format
     * @returns {string} Formatted price string
     */
    function formatPrice(price) {
        // Convert to number if it's a string
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        // Check if it's a valid number
        if (isNaN(numPrice)) {
            console.warn('Invalid price:', price);
            return 'R$ 0,00';
        }
        
        // Format to Brazilian currency
        return numPrice.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    /**
     * Load plans from API
     */
    async function loadPlans() {
        console.log('🔄 Carregando planos...');
        
        try {
            const response = await fetch(`${API_URL}/plans`);
            console.log('📡 Resposta da API:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📦 Dados recebidos:', data);
            
            if (!data.success) {
                throw new Error(data.message || 'Erro ao carregar planos');
            }
            
            const plans = data.plans || [];
            console.log('📋 Planos encontrados:', plans.length);
            
            if (plans.length === 0) {
                console.warn('⚠️ Nenhum plano encontrado na API, usando fallback estático');
                displayFallbackPlans();
                return;
            }
            
            displayPlans(plans);
            console.log('✅ Planos exibidos com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar planos da API:', error);
            // Show fallback plans instead of error message
            displayFallbackPlans();
        }
    }

    /**
     * Display fallback plans when API is unavailable
     */
    function displayFallbackPlans() {
        const fallbackPlans = [
            {
                name: 'Mensal',
                slug: 'profissional-mensal',
                price: 139.90,  // Valor cheio mensal
                features: [
                    'Até 50 veículos',
                    'Catálogo com URL personalizada',
                    'Suporte prioritário',
                    'Relatórios avançados',
                    'Integração WhatsApp',
                    'Destaque nos anúncios'
                ],
                checkout_url: 'https://buy.stripe.com/test_6oUcMY7Xw32X7BgcZa4ko00'
            },
            {
                name: 'Trimestral',
                slug: 'profissional-trimestral',
                price: 359.70,  // R$ 119,90/mês x 3
                features: [
                    'Até 50 veículos',
                    'Catálogo com URL personalizada',
                    'Suporte prioritário',
                    'Relatórios avançados',
                    'Integração WhatsApp',
                    'Destaque nos anúncios'
                ],
                checkout_url: 'https://buy.stripe.com/test_TRIMESTRAL_LINK_AQUI'
            },
            {
                name: 'Anual',
                slug: 'profissional-anual',
                price: 1318.80,  // R$ 109,90/mês x 12
                features: [
                    'Até 50 veículos',
                    'Catálogo com URL personalizada',
                    'Suporte prioritário',
                    'Relatórios avançados',
                    'Integração WhatsApp',
                    'Destaque nos anúncios'
                ],
                checkout_url: 'https://buy.stripe.com/test_ANUAL_LINK_AQUI'
            }
        ];
        
        displayPlans(fallbackPlans);
    }

    /**
     * Display plans in the page
     * @param {Array} plans - Array of plan objects
     */
    function displayPlans(plans) {
        // Try to find container by ID first, then by class
        const plansContainer = document.querySelector('#plans-container') || 
                               document.querySelector('#planos .container .row');
        
        if (!plansContainer) {
            console.error('Container de planos não encontrado');
            return;
        }

        // Clear existing content
        plansContainer.innerHTML = '';

        // Sort plans: Mensal, Trimestral, Anual
        const sortedPlans = plans.sort((a, b) => {
            const order = ['profissional-mensal', 'profissional-trimestral', 'profissional-anual'];
            return order.indexOf(a.slug) - order.indexOf(b.slug);
        });

        sortedPlans.forEach((plan, index) => {
            // Ensure price is a number
            const planPrice = typeof plan.price === 'string' 
                ? parseFloat(plan.price) 
                : Number(plan.price);
            
            // Validate price
            if (isNaN(planPrice)) {
                console.warn(`Invalid price for plan ${plan.name}:`, plan.price);
                return;
            }

            // Calculate price per month, period label, and savings
            // Mensal é a referência (R$ 139,90/mês)
            const monthlyReferencePrice = 139.90;
            let pricePerMonth, periodLabel, savingsAmount, savingsPercent, showSavings = false;
            const planName = plan.name.toLowerCase();
            
            if (planName.includes('mensal')) {
                // Mensal: apenas valor cheio, sem desconto
                pricePerMonth = planPrice;
                periodLabel = '/mês';
                showSavings = false;
            } else if (planName.includes('trimestral')) {
                // Trimestral: R$ 119,90/mês (R$ 359,70/trimestre)
                pricePerMonth = planPrice / 3;
                periodLabel = '/mês';
                savingsAmount = monthlyReferencePrice - pricePerMonth; // R$ 20,00/mês
                savingsPercent = ((savingsAmount / monthlyReferencePrice) * 100).toFixed(1); // 14,3%
                showSavings = true;
            } else if (planName.includes('anual')) {
                // Anual: R$ 109,90/mês (R$ 1.318,80/ano)
                pricePerMonth = planPrice / 12;
                periodLabel = '/mês';
                savingsAmount = monthlyReferencePrice - pricePerMonth; // R$ 30,00/mês
                savingsPercent = ((savingsAmount / monthlyReferencePrice) * 100).toFixed(1); // 21,4%
                showSavings = true;
            } else {
                pricePerMonth = planPrice;
                periodLabel = '/mês';
                showSavings = false;
            }

            // Format price per month
            const formattedPricePerMonth = formatPrice(pricePerMonth);
            const formattedSavings = savingsAmount ? formatPrice(savingsAmount) : '';
            
            // Determine if plan is popular/featured (Trimestral is featured)
            const isFeatured = plan.slug === 'profissional-trimestral';
            
            // Get features array
            const features = Array.isArray(plan.features) 
                ? plan.features 
                : (typeof plan.features === 'string' 
                    ? JSON.parse(plan.features || '[]') 
                    : []);
            
            // Get Stripe checkout link based on plan
            // Prioridade: checkout_url do plano > links hardcoded > cadastro.html
            let checkoutLink = plan.checkout_url || plan.stripe_link || 'cadastro.html';
            
            if (!checkoutLink || checkoutLink === 'cadastro.html') {
                if (plan.slug === 'profissional-mensal') {
                    checkoutLink = 'https://buy.stripe.com/test_6oUcMY7Xw32X7BgcZa4ko00';
                } else if (plan.slug === 'profissional-trimestral') {
                    // Link para trimestral - manter estrutura, substituir depois
                    checkoutLink = 'https://buy.stripe.com/test_TRIMESTRAL_LINK_AQUI';
                } else if (plan.slug === 'profissional-anual') {
                    // Link para anual - manter estrutura, substituir depois
                    checkoutLink = 'https://buy.stripe.com/test_ANUAL_LINK_AQUI';
                } else {
                    checkoutLink = `cadastro.html${plan.slug ? `?plan=${plan.slug}` : ''}`;
                }
            }
            
            // Create plan card HTML
            const planCard = `
                <div class="col-md-6 col-lg-4">
                    <div class="pricing-card ${isFeatured ? 'featured' : ''}">
                        ${isFeatured ? `
                        <div class="pricing-badge">
                            <i class="bi bi-star-fill me-1"></i>Mais Popular
                        </div>
                        ` : ''}
                        <h3 class="pricing-title">${plan.name || 'Plano'}</h3>
                        <div class="pricing-price">
                            R$ ${formattedPricePerMonth}
                            <span class="fs-4">${periodLabel}</span>
                        </div>
                        ${showSavings ? `
                        <p class="pricing-period">
                            <span class="text-success fw-semibold d-block mb-1">
                                <i class="bi bi-check-circle me-1"></i>
                                Economia de R$ ${formattedSavings}/mês
                            </span>
                            <small class="text-muted">(aprox. ${savingsPercent}% de desconto)</small>
                        </p>
                        ` : `
                        <p class="pricing-period">
                            <small class="text-muted">Renovação mensal</small>
                        </p>
                        `}
                        <ul class="pricing-features">
                            ${features.map(feature => `
                                <li>
                                    <i class="bi bi-check-circle-fill"></i>
                                    <span>${feature}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <a href="${checkoutLink}" class="btn btn-primary w-100 btn-lg" target="_blank" rel="noopener noreferrer">
                            Começar Agora
                        </a>
                    </div>
                </div>
            `;
            
            plansContainer.insertAdjacentHTML('beforeend', planCard);
        });
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    function showError(message) {
        const plansContainer = document.querySelector('#plans-container') || 
                               document.querySelector('#planos .container .row');
        
        if (plansContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-warning text-center col-12';
            errorDiv.innerHTML = `
                <i class="bi bi-exclamation-triangle me-2"></i>
                ${message}
            `;
            plansContainer.innerHTML = '';
            plansContainer.appendChild(errorDiv);
        }
    }

    // Initialize when DOM is ready
    function init() {
        console.log('🚀 Inicializando landing-plans.js');
        console.log('🌐 API_URL:', API_URL);
        
        const plansContainer = document.querySelector('#plans-container') || 
                               document.querySelector('#planos .container .row');
        
        if (!plansContainer) {
            console.error('❌ Container de planos não encontrado, tentando novamente...');
            // Retry after a short delay (max 3 attempts)
            if (!window.planInitAttempts) window.planInitAttempts = 0;
            window.planInitAttempts++;
            
            if (window.planInitAttempts < 5) {
                setTimeout(init, 200);
            } else {
                console.error('❌ Container não encontrado após várias tentativas');
                // Try to find and create container manually
                const section = document.querySelector('#planos');
                if (section) {
                    const container = section.querySelector('.container');
                    if (container) {
                        const row = document.createElement('div');
                        row.className = 'row g-4 justify-content-center';
                        row.id = 'plans-container';
                        container.appendChild(row);
                        loadPlans();
                    }
                }
            }
            return;
        }
        
        console.log('✅ Container encontrado');
        loadPlans();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM already loaded, but wait a bit to ensure all scripts are ready
        setTimeout(init, 100);
    }
})();

