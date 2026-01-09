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
<<<<<<< HEAD
        // Apenas se realmente existir uma sidebar na página
        if (sidebar && document.querySelector('.sidebar')) {
            document.body.classList.add('has-sidebar');
        }
=======
        document.body.classList.add('has-sidebar');
>>>>>>> e34ba1f1ea9dc0e8c60145c68c6ee6773ea5838c

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
<<<<<<< HEAD
=======
            }
        }

        // Ajustar imediatamente ao carregar
        adjustNavbarPosition();

        // Ajustar quando redimensionar
        window.addEventListener('resize', adjustNavbarPosition);

        // Em mobile, o navbar-toggler controla o collapse do navbar (não mais a sidebar)
        // O Bootstrap já gerencia isso automaticamente, então não precisamos interferir
        if (navbar) {
            const navbarToggler = navbar.querySelector('.navbar-toggler');
            if (navbarToggler && !navbarToggler.dataset.sidebarInitialized) {
                // Adicionar atributo data-sidebar-initialized apenas para compatibilidade
                navbarToggler.setAttribute('data-sidebar-initialized', 'true');
                // Não precisamos mais interceptar o clique - deixar o Bootstrap gerenciar
>>>>>>> e34ba1f1ea9dc0e8c60145c68c6ee6773ea5838c
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
    
    function initResponsiveTables() {
        const tables = document.querySelectorAll('.table-responsive table, .table');
        
        tables.forEach(table => {
            if (window.innerWidth <= 768) {
                convertTableToCards(table);
            }
        });

        // Reverter ao redimensionar
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                if (window.innerWidth > 768) {
                    tables.forEach(table => {
                        const cardContainer = table.parentElement.querySelector('.table-mobile-cards');
                        if (cardContainer) {
                            cardContainer.remove();
                            table.style.display = '';
                        }
                    });
                } else {
                    tables.forEach(table => {
                        if (!table.parentElement.querySelector('.table-mobile-cards')) {
                            convertTableToCards(table);
                        }
                    });
                }
            }, 250);
        });
    }

    function convertTableToCards(table) {
        // Verificar se já foi convertido
        if (table.parentElement.querySelector('.table-mobile-cards')) {
            return;
        }

        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');
        if (!thead || !tbody) return;

        // Obter headers
        const headers = Array.from(thead.querySelectorAll('th')).map(th => th.textContent.trim());

        // Criar container de cards
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'table-mobile-cards';

        // Converter cada linha em card
        tbody.querySelectorAll('tr').forEach((row, index) => {
            const card = document.createElement('div');
            card.className = 'card mb-3';

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const cells = row.querySelectorAll('td');
            cells.forEach((cell, cellIndex) => {
                if (headers[cellIndex]) {
                    const item = document.createElement('div');
                    item.className = 'mb-2';
                    
                    const label = document.createElement('strong');
                    label.textContent = headers[cellIndex] + ': ';
                    label.className = 'text-muted';
                    
                    const value = document.createElement('span');
                    value.innerHTML = cell.innerHTML;
                    
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
                actionsDiv.innerHTML = actionsCell.innerHTML;
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

    // Tornar função global
    window.closeFiltersModal = closeFiltersModal;

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
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    initResponsiveTables();
                    initLazyLoading();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();

