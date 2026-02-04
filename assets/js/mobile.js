/**
 * Mobile Utilities for AutoStock
 * Gerencia sidebar, tabelas responsivas, filtros e outras funcionalidades mobile
 */

(function() {
    'use strict';

    // ============================================
    // SIDEBAR MOBILE
    // ============================================
    
    function initSidebarMobile() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Adicionar classe ao body para indicar que há sidebar (para CSS)
        // Apenas se realmente existir uma sidebar na página
        if (sidebar && document.querySelector('.sidebar')) {
            document.body.classList.add('has-sidebar');
        }

        // Função para ajustar posição do navbar em mobile
        function adjustNavbarPosition() {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;

            if (window.innerWidth <= 768) {
                // Em mobile, fixar navbar no topo se não tiver classe fixed-top
                if (!navbar.classList.contains('fixed-top')) {
                    navbar.style.position = 'fixed';
                    navbar.style.top = '0';
                    navbar.style.left = '0';
                    navbar.style.right = '0';
                    navbar.style.zIndex = '1050';
                    navbar.style.width = '100%';
                    // CSS já adiciona padding-top, mas garantir via JS também
                    if (!document.body.style.paddingTop) {
                        document.body.style.paddingTop = '56px';
                    }
                }
            } else {
                // Em desktop, remover estilos inline se não tiver classe fixed-top
                if (!navbar.classList.contains('fixed-top')) {
                    navbar.style.position = '';
                    navbar.style.top = '';
                    navbar.style.left = '';
                    navbar.style.right = '';
                    navbar.style.zIndex = '';
                    navbar.style.width = '';
                    document.body.style.paddingTop = '';
                }
            }
        }

        // Ajustar imediatamente ao carregar
        adjustNavbarPosition();

        // Ajustar quando redimensionar
        window.addEventListener('resize', adjustNavbarPosition);

        // Em mobile, controlar o menu do navbar
        if (navbar) {
            const navbarToggler = navbar.querySelector('.navbar-toggler');
            const navbarCollapse = navbar.querySelector('.navbar-collapse');
            
            if (navbarToggler && navbarCollapse) {
                // Função para controlar scroll do body
                function toggleBodyScroll(isOpen) {
                    if (window.innerWidth <= 768) {
                        if (isOpen) {
                            document.body.classList.add('menu-open');
                            // Salvar scroll position
                            const scrollY = window.scrollY;
                            document.body.style.top = `-${scrollY}px`;
                        } else {
                            const scrollY = document.body.style.top;
                            document.body.classList.remove('menu-open');
                            document.body.style.top = '';
                            if (scrollY) {
                                window.scrollTo(0, parseInt(scrollY || '0') * -1);
                            }
                        }
                    }
                }
                
                // Listener para detectar quando menu abre/fecha (Bootstrap event)
                navbarCollapse.addEventListener('show.bs.collapse', function() {
                    toggleBodyScroll(true);
                });
                
                navbarCollapse.addEventListener('hide.bs.collapse', function() {
                    toggleBodyScroll(false);
                });
                
                // Fechar menu ao clicar fora
                let clickOutsideHandler = function(e) {
                    if (window.innerWidth <= 768 && navbarCollapse.classList.contains('show')) {
                        // Verificar se o clique foi fora do menu e do toggler
                        const isClickInsideMenu = navbarCollapse.contains(e.target);
                        const isClickOnToggler = navbarToggler.contains(e.target);
                        
                        if (!isClickInsideMenu && !isClickOnToggler) {
                            // Fechar o menu apenas se não estiver clicando no próprio menu
                            if (navbarToggler && !navbarToggler.classList.contains('collapsed')) {
                                navbarToggler.click();
                            }
                        }
                    }
                };
                
                // Usar capture phase para garantir que funciona
                document.addEventListener('click', clickOutsideHandler, true);
                
                // Fechar menu ao clicar em um link
                const navLinks = navbarCollapse.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        // Se não for link de logout (que tem onclick)
                        if (!link.getAttribute('onclick')) {
                            if (window.innerWidth <= 768 && navbarCollapse.classList.contains('show')) {
                                // Pequeno delay para garantir que a navegação funcione
                                setTimeout(() => {
                                    if (navbarToggler && !navbarToggler.classList.contains('collapsed')) {
                                        navbarToggler.click();
                                    }
                                }, 150);
                            }
                        }
                    });
                });
                
                // Adicionar atributo para compatibilidade
                if (!navbarToggler.dataset.sidebarInitialized) {
                    navbarToggler.setAttribute('data-sidebar-initialized', 'true');
                }
            }
        }
        
        // Em desktop, garantir que sidebar esteja visível
        if (window.innerWidth > 768 && sidebar) {
            sidebar.style.display = '';
        }
    }

    // Fechar menu ao redimensionar para desktop
    window.addEventListener('resize', function() {
        const navbar = document.querySelector('.navbar');
        const navbarCollapse = navbar ? navbar.querySelector('.navbar-collapse') : null;
        
        if (window.innerWidth > 768) {
            // Fechar menu mobile se estiver aberto
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                const navbarToggler = navbar.querySelector('.navbar-toggler');
                if (navbarToggler) {
                    navbarToggler.click();
                }
            }
            // Remover bloqueio de scroll
            document.body.classList.remove('menu-open');
        }
    });

    // ============================================
    // TABELAS RESPONSIVAS (Converter para Cards)
    // ============================================
    
    // Flags para evitar loops infinitos
    let isConverting = false;
    let observers = new Map();
    let lastProcessedWidth = window.innerWidth;
    
    function initResponsiveTables() {
        const tables = document.querySelectorAll('.table-responsive table, .table');
        
        function processTables(force = false) {
            // Evitar processamento se já estiver convertendo
            if (isConverting && !force) {
                return;
            }
            
            const currentWidth = window.innerWidth;
            const isMobile = currentWidth <= 768;
            const wasMobile = lastProcessedWidth <= 768;
            
            // Se forçar, processar independente da mudança de largura
            // Caso contrário, só processar se mudou de mobile para desktop ou vice-versa
            if (!force && isMobile === wasMobile && currentWidth === lastProcessedWidth) {
                return;
            }
            
            lastProcessedWidth = currentWidth;
            isConverting = true;
            
            tables.forEach(table => {
                if (isMobile) {
                    // Remover cards existentes antes de recriar
                    const existingCards = table.parentElement.querySelector('.table-mobile-cards');
                    if (existingCards) {
                        existingCards.remove();
                    }
                    // Verificar se há dados antes de converter
                    const tbody = table.querySelector('tbody');
                    if (tbody) {
                        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
                            // Filtrar linhas válidas (não spinner, não erro, não vazia)
                            return !row.querySelector('.spinner-border') && 
                                   !row.querySelector('.text-danger') && 
                                   row.textContent.trim() !== '' &&
                                   row.cells.length > 1;
                        });
                        
                        // Converter se houver dados válidos
                        if (rows.length > 0) {
                            // Aguardar um pouco para garantir que dados foram renderizados
                            setTimeout(() => {
                                convertTableToCards(table);
                            }, 50);
                        }
                    }
                } else {
                    const cardContainer = table.parentElement.querySelector('.table-mobile-cards');
                    if (cardContainer) {
                        cardContainer.remove();
                    }
                    table.style.display = '';
                }
            });
            
            setTimeout(() => {
                isConverting = false;
            }, 100);
        }
        
        // Processar imediatamente, mas aguardar um pouco para garantir que DOM está pronto
        function initialProcess() {
            // Se estiver em mobile, forçar processamento mesmo se não mudou largura
            if (window.innerWidth <= 768) {
                lastProcessedWidth = -1; // Forçar processamento
                processTables(true); // Forçar conversão
            } else {
                processTables();
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initialProcess, 100);
            });
        } else {
            setTimeout(initialProcess, 100);
        }
        
        // Também processar após um delay maior para garantir que dados foram carregados
        setTimeout(() => {
            if (window.innerWidth <= 768) {
                const tables = document.querySelectorAll('.table-responsive table, .table');
                tables.forEach(table => {
                    const tbody = table.querySelector('tbody');
                    if (tbody) {
                        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
                            return !row.querySelector('.spinner-border') && 
                                   !row.querySelector('.text-danger') && 
                                   row.textContent.trim() !== '' &&
                                   row.cells.length > 1;
                        });
                        
                        if (rows.length > 0) {
                            const existingCards = table.parentElement.querySelector('.table-mobile-cards');
                            if (!existingCards) {
                                convertTableToCards(table);
                            }
                        }
                    }
                });
            }
        }, 1000);

        // Reverter ao redimensionar com debounce mais robusto
        let resizeTimeout;
        let orientationTimeout;
        
        function handleResize() {
            clearTimeout(resizeTimeout);
            clearTimeout(orientationTimeout);
            
            resizeTimeout = setTimeout(() => {
                processTables();
            }, 300);
        }
        
        // Detectar mudança de orientação especificamente
        window.addEventListener('orientationchange', function() {
            clearTimeout(orientationTimeout);
            orientationTimeout = setTimeout(() => {
                // Forçar recalculo após orientação mudar
                lastProcessedWidth = -1;
                processTables();
            }, 500);
        });
        
        window.addEventListener('resize', handleResize);
        
        // Observar mudanças no tbody para recriar cards quando dados são carregados
        // Mas apenas uma vez por tabela e com proteção contra loops
        tables.forEach(table => {
            const tbody = table.querySelector('tbody');
            if (tbody && !observers.has(table)) {
                let isProcessing = false;
                
                const observer = new MutationObserver(function(mutations) {
                    // Ignorar se já estiver processando ou se não for mobile
                    if (isProcessing || isConverting || window.innerWidth > 768) {
                        return;
                    }
                    
                    // Verificar se realmente houve mudança relevante
                    const hasRelevantChange = mutations.some(mutation => {
                        const hasAdded = Array.from(mutation.addedNodes).some(node => {
                            return node.nodeType === 1 && (
                                node.matches && node.matches('tr') ||
                                node.querySelector && node.querySelector('tr')
                            );
                        });
                        const hasRemoved = Array.from(mutation.removedNodes).some(node => {
                            return node.nodeType === 1 && (
                                node.matches && node.matches('tr') ||
                                node.querySelector && node.querySelector('tr')
                            );
                        });
                        return hasAdded || hasRemoved;
                    });
                    
                    if (!hasRelevantChange) {
                        return;
                    }
                    
                    // Verificar se há dados válidos (não apenas spinner sendo removido)
                    const tbody = table.querySelector('tbody');
                    if (!tbody) return;
                    
                    const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
                        return !row.querySelector('.spinner-border') && 
                               !row.querySelector('.text-danger') && 
                               row.textContent.trim() !== '' &&
                               row.cells.length > 1;
                    });
                    
                    if (rows.length === 0) {
                        return;
                    }
                    
                    isProcessing = true;
                    
                    // Desabilitar observer temporariamente
                    observer.disconnect();
                    
                    setTimeout(() => {
                        // Verificar novamente se ainda está em mobile
                        if (window.innerWidth > 768) {
                            isProcessing = false;
                            observer.observe(tbody, {
                                childList: true,
                                subtree: true
                            });
                            return;
                        }
                        
                        const cardContainer = table.parentElement.querySelector('.table-mobile-cards');
                        if (cardContainer) {
                            cardContainer.remove();
                        }
                        
                        // Forçar conversão
                        convertTableToCards(table);
                        
                        // Reativar observer após processamento
                        setTimeout(() => {
                            observer.observe(tbody, {
                                childList: true,
                                subtree: true
                            });
                            isProcessing = false;
                        }, 200);
                    }, 200);
                });
                
                observer.observe(tbody, {
                    childList: true,
                    subtree: true
                });
                
                observers.set(table, observer);
            }
        });
    }

    function convertTableToCards(table) {
        // Verificar se já foi convertido
        if (table.parentElement.querySelector('.table-mobile-cards')) {
            return;
        }
        
        // Verificar se não está em modo mobile
        if (window.innerWidth > 768) {
            return;
        }

        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        if (!thead || !tbody) {
            console.warn('Table structure incomplete for mobile conversion');
            return;
        }
        
        // Verificar se há dados para exibir (ignorar spinner e mensagens de erro/vazio)
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(row => {
            const hasSpinner = row.querySelector('.spinner-border');
            const hasError = row.querySelector('.text-danger');
            const isEmpty = row.textContent.trim() === '';
            const isSingleCell = row.cells.length === 1;
            const isSingleCellWithMessage = isSingleCell && (
                row.textContent.includes('Nenhum') || 
                row.textContent.includes('Carregando') ||
                row.textContent.includes('Erro')
            );
            
            return !hasSpinner && !hasError && !isEmpty && !isSingleCellWithMessage && row.cells.length > 1;
        });
        
        if (rows.length === 0) {
            return;
        }

        // Obter headers
        const headers = Array.from(thead.querySelectorAll('th')).map(th => th.textContent.trim());

        // Criar container de cards
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'table-mobile-cards';

        // Converter cada linha em card
        tbody.querySelectorAll('tr').forEach((row, index) => {
            // Pular linha de loading, erro ou vazia
            if (row.querySelector('.spinner-border') || 
                row.querySelector('.text-danger') || 
                row.querySelector('.text-muted') && row.cells.length === 1 ||
                row.textContent.trim() === '') {
                return;
            }
            
            const card = document.createElement('div');
            card.className = 'card mb-3';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const cells = row.querySelectorAll('td');
            cells.forEach((cell, cellIndex) => {
                // Pular última célula se for ações (será adicionada depois)
                if (cellIndex === cells.length - 1 && cell.querySelector('.btn, a')) {
                    return;
                }
                
                if (headers[cellIndex]) {
                    const item = document.createElement('div');
                    item.className = 'mb-3';
                    item.style.wordWrap = 'break-word';
                    item.style.overflowWrap = 'break-word';
                    
                    const label = document.createElement('strong');
                    label.textContent = headers[cellIndex] + ': ';
                    label.className = 'text-muted d-block mb-1';
                    label.style.fontSize = '0.875rem';
                    
                    const value = document.createElement('div');
                    value.innerHTML = cell.innerHTML;
                    value.style.wordWrap = 'break-word';
                    value.style.overflowWrap = 'break-word';
                    
                    // Ajustar imagens dentro dos cards
                    const images = value.querySelectorAll('img');
                    images.forEach(img => {
                        // Para imagens de veículos, sempre tratar como miniatura no mobile
                        if (img.classList.contains('vehicle-thumbnail') || img.parentElement.classList.contains('d-flex')) {
                            // Miniatura de veículo no mobile
                            img.style.maxWidth = '100px';
                            img.style.width = '100px';
                            img.style.height = '75px';
                            img.style.objectFit = 'cover';
                            img.style.flexShrink = '0';
                            img.style.borderRadius = '8px';
                            img.style.display = 'block';
                            img.style.marginBottom = '0.5rem';
                            
                            // Garantir que o container pai permita a exibição
                            const parent = img.parentElement;
                            if (parent) {
                                parent.style.display = 'flex';
                                parent.style.alignItems = 'center';
                                parent.style.gap = '0.75rem';
                                parent.style.flexWrap = 'wrap';
                            }
                        } else {
                            img.style.maxWidth = '100%';
                            img.style.height = 'auto';
                        }
                        
                        // Garantir que onerror está presente
                        const placeholderUrl = 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%2775%27%3E%3Crect fill=%27%23e2e8f0%27 width=%27100%27 height=%2775%27/%3E%3Ctext fill=%27%2394a3b8%27 font-family=%27sans-serif%27 font-size=%2710%27 dy=%2710.5%27 font-weight=%27bold%27 x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27%3ESem imagem%3C/text%3E%3C/svg%3E';
                        img.onerror = function() {
                            this.onerror = null;
                            this.src = placeholderUrl;
                        };
                    });
                    
                    item.appendChild(label);
                    item.appendChild(value);
                    cardBody.appendChild(item);
                }
            });

            // Adicionar ações se existirem
            const actionsCell = cells[cells.length - 1];
            if (actionsCell && actionsCell.querySelector('.btn, a')) {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'mt-3 pt-3 border-top d-flex gap-2 flex-wrap';
                actionsDiv.style.width = '100%';
                
                // Clonar botões para evitar problemas de referência
                const buttons = actionsCell.querySelectorAll('.btn, a');
                buttons.forEach(btn => {
                    const clonedBtn = btn.cloneNode(true);
                    clonedBtn.style.flex = '1 1 auto';
                    clonedBtn.style.minWidth = '44px';
                    clonedBtn.style.minHeight = '44px';
                    clonedBtn.style.height = '44px';
                    clonedBtn.style.display = 'flex';
                    clonedBtn.style.alignItems = 'center';
                    clonedBtn.style.justifyContent = 'center';
                    clonedBtn.style.padding = '0.5rem 1rem';
                    
                    // Ajustar ícones dentro dos botões
                    const icons = clonedBtn.querySelectorAll('i');
                    icons.forEach(icon => {
                        icon.style.fontSize = '1rem';
                        icon.style.lineHeight = '1';
                    });
                    
                    actionsDiv.appendChild(clonedBtn);
                });
                
                cardBody.appendChild(actionsDiv);
            }

            card.appendChild(cardBody);
            cardsContainer.appendChild(card);
        });

        // Ocultar tabela e mostrar cards
        table.style.display = 'none';
        table.parentElement.appendChild(cardsContainer);
    }

    // ============================================
    // FILTROS MODAL (loja.html)
    // ============================================
    
    function initFiltersModal() {
        const filtersSidebar = document.querySelector('.filters-sidebar');
        if (!filtersSidebar) return;

        // Criar botão de filtros
        const resultsHeader = document.querySelector('.results-header');
        if (resultsHeader && !document.getElementById('filtersToggle')) {
            const filtersBtn = document.createElement('button');
            filtersBtn.id = 'filtersToggle';
            filtersBtn.className = 'btn btn-primary d-lg-none mb-3';
            filtersBtn.innerHTML = '<i class="bi bi-funnel me-2"></i>Filtros';
            filtersBtn.onclick = toggleFiltersModal;
            resultsHeader.parentElement.insertBefore(filtersBtn, resultsHeader);
        }

        // Criar modal de filtros apenas uma vez
        if (!document.getElementById('filtersModal')) {
            const modal = document.createElement('div');
            modal.id = 'filtersModal';
            modal.className = 'filters-modal';
            
            const modalHeader = document.createElement('div');
            modalHeader.className = 'd-flex justify-content-between align-items-center p-3 border-bottom';
            modalHeader.innerHTML = `
                <h5 class="mb-0 fw-bold">Filtros</h5>
                <button class="btn btn-link p-0" onclick="closeFiltersModal()">
                    <i class="bi bi-x-lg fs-4"></i>
                </button>
            `;
            
            const modalBody = document.createElement('div');
            modalBody.className = 'p-3';
            
            // Copiar HTML da sidebar (removendo título)
            // Como a sidebar original está oculta em mobile via CSS, não há conflito visual
            // Os event listeners do loja.js funcionam nos elementos originais (ocultos)
            let filtersHTML = filtersSidebar.innerHTML;
            
            // Remover o título "Filtros"
            filtersHTML = filtersHTML.replace(/<h5[^>]*class="[^"]*fw-bold[^"]*"[^>]*>.*?Filtros.*?<\/h5>/i, '');
            
            modalBody.innerHTML = filtersHTML;
            
            // Sincronizar eventos: quando mudar no modal, atualizar no original (oculto)
            // Isso garante que os filtros funcionem corretamente
            syncFilterValues(modalBody);
            
            modal.appendChild(modalHeader);
            modal.appendChild(modalBody);
            document.body.appendChild(modal);
        }
    }

    function syncFilterValues(modalBody) {
        // Sincronizar valores entre elementos do modal e originais
        // Quando o usuário interage com o modal, atualizar os elementos originais (ocultos)
        modalBody.addEventListener('input', function(e) {
            if (e.target.id) {
                const original = document.getElementById(e.target.id);
                if (original && original !== e.target) {
                    original.value = e.target.value;
                    original.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
        });
        
        modalBody.addEventListener('change', function(e) {
            if (e.target.id) {
                const original = document.getElementById(e.target.id);
                if (original && original !== e.target) {
                    original.value = e.target.value;
                    original.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
    }
    
    function toggleFiltersModal() {
        const modal = document.getElementById('filtersModal');
        if (modal) {
            modal.classList.toggle('show');
            document.body.style.overflow = modal.classList.contains('show') ? 'hidden' : '';
        }
    }

    function closeFiltersModal() {
        const modal = document.getElementById('filtersModal');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Tornar funções globais para acesso externo
    window.closeFiltersModal = closeFiltersModal;
    window.convertTableToCards = convertTableToCards;

    // ============================================
    // LAZY LOADING DE IMAGENS
    // ============================================
    
    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Navegador suporta lazy loading nativo
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.loading = 'lazy';
            });
        } else {
            // Fallback com Intersection Observer
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // ============================================
    // INICIALIZAÇÃO
    // ============================================
    
    function init() {
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        initSidebarMobile();
        initResponsiveTables();
        initFiltersModal();
        initLazyLoading();
    }

    // Inicializar
    init();

    // Re-inicializar se necessário após carregamento dinâmico
    // Mas com proteção para evitar loops
    if (window.MutationObserver) {
        let globalObserverActive = true;
        const globalObserver = new MutationObserver(function(mutations) {
            if (!globalObserverActive) return;
            
            const hasNewTables = Array.from(mutations).some(mutation => {
                return Array.from(mutation.addedNodes).some(node => {
                    return node.nodeType === 1 && (
                        (node.matches && node.matches('.table, .table-responsive')) ||
                        (node.querySelector && node.querySelector('.table, .table-responsive'))
                    );
                });
            });
            
            if (hasNewTables) {
                globalObserverActive = false;
                setTimeout(() => {
                    initResponsiveTables();
                    initLazyLoading();
                    globalObserverActive = true;
                }, 200);
            } else {
                initLazyLoading();
            }
        });

        globalObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();

