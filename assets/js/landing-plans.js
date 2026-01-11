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
     * Create free plan object
     */
    function createFreePlan() {
        return {
            name: 'Grátis',
            slug: 'gratis',
            price: 0,
            features: [
                'Até 5 veículos',
                'Catálogo com URL personalizada',
                'Integração WhatsApp'
            ],
            checkout_url: 'cadastro.html?plan=gratis'
        };
    }

    /**
     * Check if we are on planos.html page
     */
    function isPlanosPage() {
        return window.location.pathname.includes('planos.html') || 
               window.location.href.includes('planos.html') ||
               document.querySelector('body').classList.contains('planos-page');
    }

    /**
     * Load plans from API
     */
    async function loadPlans() {
        console.log('🔄 Carregando planos...');
        
        // Verificar se estamos na página planos.html
        const isPlanos = isPlanosPage();
        console.log('📄 Página planos.html?', isPlanos);
        
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
                displayFallbackPlans(isPlanos);
                return;
            }
            
            let filteredPlans = plans;
            
            if (isPlanos) {
                // APENAS na página planos.html: remover plano grátis, manter todos os planos pagos (Mensal, Trimestral, Anual)
                filteredPlans = plans.filter(p => 
                    p.slug !== 'gratis' && 
                    p.price !== 0 && 
                    !p.name.toLowerCase().includes('grátis') && 
                    !p.name.toLowerCase().includes('gratis')
                );
            } else {
                // Todas as outras páginas (index.html, etc.): manter plano grátis e todos os planos pagos incluindo anual
                // Verificar se já existe plano grátis na API
                const existingFreePlan = plans.find(p => p.slug === 'gratis' || p.price === 0 || p.name.toLowerCase().includes('grátis') || p.name.toLowerCase().includes('gratis'));
                
                // Se não existir na API, adicionar nosso plano grátis em primeiro lugar
                const freePlan = existingFreePlan || createFreePlan();
                const otherPlans = existingFreePlan ? plans.filter(p => p.slug !== 'gratis' && p.price !== 0 && !p.name.toLowerCase().includes('grátis') && !p.name.toLowerCase().includes('gratis')) : plans;
                filteredPlans = [freePlan, ...otherPlans];
            }
            
            displayPlans(filteredPlans, isPlanos);
            console.log('✅ Planos exibidos com sucesso');
        } catch (error) {
            console.error('❌ Erro ao carregar planos da API:', error);
            // Show fallback plans instead of error message
            displayFallbackPlans(isPlanos);
        }
    }

    /**
     * Display fallback plans when API is unavailable
     */
    function displayFallbackPlans(isPlanosPage = false) {
        const fallbackPlans = [];
        
        // Para todas as páginas EXCETO planos.html: incluir plano grátis
        if (!isPlanosPage) {
            const freePlan = createFreePlan();
            fallbackPlans.push(freePlan);
        }
        
        // Planos pagos (aparecem em todas as páginas)
        fallbackPlans.push(
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
        );
        
        displayPlans(fallbackPlans, isPlanosPage);
    }

    /**
     * Display plans in the page
     * @param {Array} plans - Array of plan objects
     * @param {boolean} isPlanosPage - Whether we are on planos.html page
     */
    function displayPlans(plans, isPlanosPage = false) {
        // Try to find container by ID first, then by class
        const plansContainer = document.querySelector('#plans-container') || 
                               document.querySelector('#planos .container .row');
        
        if (!plansContainer) {
            console.error('Container de planos não encontrado');
            return;
        }

        // Clear existing content
        plansContainer.innerHTML = '';

        // Separar plano grátis dos outros planos (apenas se não for página planos.html)
        const freePlan = isPlanosPage ? null : plans.find(p => p.slug === 'gratis' || p.price === 0 || p.name.toLowerCase().includes('grátis') || p.name.toLowerCase().includes('gratis'));
        const paidPlans = plans.filter(p => 
            p.slug !== 'gratis' && 
            p.price !== 0 && 
            !p.name.toLowerCase().includes('grátis') && 
            !p.name.toLowerCase().includes('gratis')
        );

        // Sort paid plans: Mensal, Trimestral, Anual
        const sortedPaidPlans = paidPlans.sort((a, b) => {
            const order = ['profissional-mensal', 'profissional-trimestral', 'profissional-anual'];
            return order.indexOf(a.slug) - order.indexOf(b.slug);
        });

        // Adicionar plano grátis primeiro se existir e não for página planos.html
        const sortedPlans = (!isPlanosPage && freePlan) ? [freePlan, ...sortedPaidPlans] : sortedPaidPlans;

        sortedPlans.forEach((plan, index) => {
            // Check if it's the free plan
            const isFreePlan = plan.slug === 'gratis' || plan.price === 0 || plan.name.toLowerCase().includes('grátis') || plan.name.toLowerCase().includes('gratis');
            
            // Ensure price is a number
            const planPrice = typeof plan.price === 'string' 
                ? parseFloat(plan.price) 
                : Number(plan.price);
            
            // Validate price (allow 0 for free plan)
            if (isNaN(planPrice) && !isFreePlan) {
                console.warn(`Invalid price for plan ${plan.name}:`, plan.price);
                return;
            }

            // Calculate price per month, period label, and savings
            let pricePerMonth, periodLabel, savingsAmount, savingsPercent, showSavings = false;
            const planName = plan.name.toLowerCase();
            
            if (isFreePlan) {
                // Plano grátis
                pricePerMonth = 0;
                periodLabel = '';
                showSavings = false;
            } else if (planName.includes('mensal')) {
                // Mensal: apenas valor cheio, sem desconto
                const monthlyReferencePrice = 139.90;
                pricePerMonth = planPrice;
                periodLabel = '/mês';
                showSavings = false;
            } else if (planName.includes('trimestral')) {
                // Trimestral: R$ 119,90/mês (R$ 359,70/trimestre)
                const monthlyReferencePrice = 139.90;
                pricePerMonth = planPrice / 3;
                periodLabel = '/mês';
                savingsAmount = monthlyReferencePrice - pricePerMonth; // R$ 20,00/mês
                savingsPercent = ((savingsAmount / monthlyReferencePrice) * 100).toFixed(1); // 14,3%
                showSavings = true;
            } else if (planName.includes('anual')) {
                // Anual: R$ 109,90/mês (R$ 1.318,80/ano)
                const monthlyReferencePrice = 139.90;
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
            const formattedPricePerMonth = isFreePlan ? 'Grátis' : formatPrice(pricePerMonth);
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
            
            if (isFreePlan) {
                // Plano grátis sempre vai para cadastro
                checkoutLink = 'cadastro.html?plan=gratis';
            } else if (!checkoutLink || checkoutLink === 'cadastro.html') {
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
            // Usar col-lg-3 para index (4 planos: Grátis, Mensal, Trimestral, Anual) ou col-lg-4 para planos.html (3 planos: Mensal, Trimestral, Anual)
            const colClass = isPlanosPage ? 'col-lg-4' : 'col-lg-3';
            const planCard = `
                <div class="col-md-6 ${colClass}">
                    <div class="pricing-card ${isFreePlan ? 'pricing-card-free' : ''} ${isFeatured ? 'featured' : ''}">
                        ${isFreePlan ? `
                        <div class="pricing-badge" style="background: #10B981;">
                            <i class="bi bi-gift-fill me-1"></i>Grátis Para Sempre
                        </div>
                        ` : ''}
                        ${isFeatured && !isFreePlan ? `
                        <div class="pricing-badge">
                            <i class="bi bi-star-fill me-1"></i>Mais Popular
                        </div>
                        ` : ''}
                        ${!isFreePlan ? `<h3 class="pricing-title">${plan.name || 'Plano'}</h3>` : ''}
                        <div class="pricing-price" style="${isFreePlan ? 'color: #10B981;' : ''}">
                            ${isFreePlan ? formattedPricePerMonth : `R$ ${formattedPricePerMonth}`}
                            ${!isFreePlan ? `<span class="fs-5" style="font-size: 1rem;">${periodLabel}</span>` : ''}
                        </div>
                        ${isFreePlan ? `
                        <p class="pricing-period">
                            <small class="text-muted">Para sempre, sem compromisso</small>
                        </p>
                        ` : showSavings ? `
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
                        <a href="${checkoutLink}" class="btn ${isFreePlan ? 'btn-success' : 'btn-primary'} w-100 btn-lg" ${isFreePlan ? '' : 'target="_blank" rel="noopener noreferrer"'}>
                            ${isFreePlan ? 'Começar Grátis' : 'Começar Agora'}
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

