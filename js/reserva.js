document.addEventListener('DOMContentLoaded', function() {
    // Constantes
    const PRICE_PER_DAY = 199.90;
    const DISCOUNT_THRESHOLD = 2;
    const DISCOUNT_PERCENTAGE = 0.10;
    const MAX_PEOPLE = 4;
    const PIX_CODE = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000";
    const WHATSAPP_NUMBER = "556493024167";

    // Estado inicial
    let peopleCount = 1;
    let selectedDrink = null;
    let selectedSnack = null;
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Preços dos pacotes
    const DRINK_PACKAGES = {
        'duo': { price: 69.90, name: 'Duo' },
        'trio': { price: 99.90, name: 'Trio' },
        'quarteto': { price: 149.90, name: 'Quarteto' }
    };

    const SNACK_PACKAGES = {
        'snack-basico': { price: 49.90, name: 'Snack Básico' },
        'snack-completo': { price: 89.90, name: 'Snack Completo' },
        'snack-premium': { price: 119.90, name: 'Snack Premium' }
    };

    // Elementos do DOM
    const elements = {
        decreaseButton: document.getElementById('decreasePeople'),
        increaseButton: document.getElementById('increasePeople'),
        peopleCount: document.getElementById('peopleCount'),
        prevMonthBtn: document.getElementById('prevMonth'),
        nextMonthBtn: document.getElementById('nextMonth'),
        currentMonth: document.getElementById('currentMonth'),
        datesGrid: document.getElementById('datesGrid'),
        selectedDates: document.getElementById('selected-dates'),
        datesContent: document.getElementById('dates-content'),
        datesCount: document.getElementById('dates-count'),
        selectedDrinks: document.getElementById('selected-drinks'),
        drinkName: document.getElementById('drink-name'),
        drinkPrice: document.getElementById('drink-price'),
        selectedSnacks: document.getElementById('selected-snacks'),
        snackName: document.getElementById('snack-name'),
        snackPrice: document.getElementById('snack-price'),
        discountContainer: document.getElementById('discount-container'),
        discountValue: document.getElementById('discount-value'),
        totalValue: document.getElementById('total-value'),
        paymentPopup: document.getElementById('paymentPopup'),
        nameInput: document.getElementById('name')
    };

    // Funções de utilidade
    function formatDate(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.toLocaleString('pt-BR', { month: 'short' });
        const weekday = date.toLocaleString('pt-BR', { weekday: 'short' });
        return `${weekday}, ${day} ${month}`;
    }

    function formatCurrency(value) {
        return `R$ ${value.toFixed(2)}`;
    }

    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    // Funções de atualização da UI
    function updatePeopleButtons() {
        if (elements.decreaseButton && elements.increaseButton) {
            elements.decreaseButton.disabled = peopleCount <= 1;
            elements.increaseButton.disabled = peopleCount >= MAX_PEOPLE;
        }
    }

    function updateMonthDisplay() {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        if (elements.currentMonth) {
            elements.currentMonth.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        }
    }

    function createEmptyDayCell() {
        const cell = document.createElement('div');
        cell.className = 'h-16 sm:h-20';
        return cell;
    }

    function createDayCell(date, isToday, isPast) {
        const cell = document.createElement('div');
        const day = date.getDate();

        cell.className = `date-card rounded-lg p-2 text-center border border-gray-200 h-12 sm:h-14 flex flex-col justify-center items-center ${isPast ? 'opacity-50 cursor-not-allowed' : ''} ${isToday ? 'bg-gray-200' : 'bg-white'}`;
        cell.setAttribute('data-date', date.toISOString().split('T')[0]);

        if (!isPast) {
            cell.addEventListener('click', () => {
                cell.classList.toggle('selected');
                updateSummary();
            });
        }

        cell.innerHTML = `
            <div class="flex-1 flex items-center justify-center">
                <div class="text-sm font-semibold text-gray-800">${day}</div>
            </div>
        `;

        return cell;
    }

    function generateDaysGrid() {
        if (!elements.datesGrid) return;

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        elements.datesGrid.innerHTML = '';

        for (let i = 0; i < startingDay; i++) {
            elements.datesGrid.appendChild(createEmptyDayCell());
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = isSameDay(date, new Date());
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            
            elements.datesGrid.appendChild(createDayCell(date, isToday, isPast));
        }
    }

    function updateSelectedItems() {
        if (elements.selectedDrinks && elements.drinkName && elements.drinkPrice) {
            if (selectedDrink) {
                elements.selectedDrinks.classList.remove('hidden');
                elements.drinkName.textContent = selectedDrink.name;
                elements.drinkPrice.textContent = formatCurrency(selectedDrink.price);
            } else {
                elements.selectedDrinks.classList.add('hidden');
            }
        }

        if (elements.selectedSnacks && elements.snackName && elements.snackPrice) {
            if (selectedSnack) {
                elements.selectedSnacks.classList.remove('hidden');
                elements.snackName.textContent = selectedSnack.name;
                elements.snackPrice.textContent = formatCurrency(selectedSnack.price);
            } else {
                elements.selectedSnacks.classList.add('hidden');
            }
        }

        updateSummary();
    }

    function updateSummary() {
        const selectedDates = document.querySelectorAll('.date-card.selected');
        const selectedDays = selectedDates.length;
        const datesTotal = selectedDays * PRICE_PER_DAY * peopleCount;
        let drinkTotal = selectedDrink ? selectedDrink.price : 0;
        let snackTotal = selectedSnack ? selectedSnack.price : 0;

        const subtotal = datesTotal + drinkTotal + snackTotal;
        let discount = 0;
        
        if (selectedDays > DISCOUNT_THRESHOLD) {
            discount = datesTotal * DISCOUNT_PERCENTAGE;
            if (elements.discountContainer && elements.discountValue) {
                elements.discountContainer.classList.remove('hidden');
                elements.discountValue.textContent = `-${formatCurrency(discount)}`;
            }
        } else {
            if (elements.discountContainer) {
                elements.discountContainer.classList.add('hidden');
            }
        }

        const total = subtotal - discount;
        if (elements.totalValue) {
            elements.totalValue.textContent = formatCurrency(total);
        }

        if (elements.datesContent && elements.datesCount) {
            if (selectedDays === 0) {
                elements.datesContent.innerHTML = '<div class="text-sm text-gray-500">Nenhuma data selecionada</div>';
                elements.datesCount.textContent = '0 dias';
            } else {
                elements.datesContent.innerHTML = Array.from(selectedDates)
                    .map(card => {
                        const date = card.getAttribute('data-date');
                        const dateObj = new Date(date);
                        const day = dateObj.getDate();
                        const month = dateObj.toLocaleString('pt-BR', { month: 'short' });
                        return `<div class="flex justify-between text-gray-500">
                            <span>${day} ${month}</span>
                            <span>${formatCurrency(PRICE_PER_DAY * peopleCount)}</span>
                        </div>`;
                    })
                    .join('');
                elements.datesCount.textContent = `${selectedDays} ${selectedDays === 1 ? 'dia' : 'dias'}`;
            }
        }

        // Salva os dados no localStorage
        const dates = Array.from(selectedDates).map(card => card.getAttribute('data-date'));
        localStorage.setItem('selectedDates', JSON.stringify(dates));
        localStorage.setItem('total', formatCurrency(total));
        localStorage.setItem('subtotal', formatCurrency(subtotal));
        localStorage.setItem('discount', formatCurrency(discount));
        localStorage.setItem('peopleCount', peopleCount);
        localStorage.setItem('selectedDrink', selectedDrink ? selectedDrink.name : '');
        localStorage.setItem('selectedSnack', selectedSnack ? selectedSnack.name : '');
        localStorage.setItem('drinkPrice', selectedDrink ? formatCurrency(selectedDrink.price) : 'R$ 0,00');
        localStorage.setItem('snackPrice', selectedSnack ? formatCurrency(selectedSnack.price) : 'R$ 0,00');
    }

    // Event Listeners
    if (elements.decreaseButton) {
        elements.decreaseButton.addEventListener('click', () => {
            if (peopleCount > 1) {
                peopleCount--;
                elements.peopleCount.textContent = peopleCount;
                updatePeopleButtons();
                updateSummary();
            }
        });
    }

    if (elements.increaseButton) {
        elements.increaseButton.addEventListener('click', () => {
            if (peopleCount < MAX_PEOPLE) {
                peopleCount++;
                elements.peopleCount.textContent = peopleCount;
                updatePeopleButtons();
                updateSummary();
            }
        });
    }

    if (elements.prevMonthBtn) {
        elements.prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateMonthDisplay();
            generateDaysGrid();
        });
    }

    if (elements.nextMonthBtn) {
        elements.nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateMonthDisplay();
            generateDaysGrid();
        });
    }

    // Adicionar interatividade aos pacotes de bebidas
    document.querySelectorAll('.drink-package').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('selected')) {
                card.classList.remove('selected');
                selectedDrink = null;
            } else {
                document.querySelectorAll('.drink-package').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedDrink = DRINK_PACKAGES[card.id];
            }
            updateSelectedItems();
        });
    });

    // Adicionar interatividade aos pacotes de snacks
    document.querySelectorAll('.snack-package').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('selected')) {
                card.classList.remove('selected');
                selectedSnack = null;
            } else {
                document.querySelectorAll('.snack-package').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedSnack = SNACK_PACKAGES[card.id];
            }
            updateSelectedItems();
        });
    });

    // Recupera seleções anteriores do localStorage
    const savedDrink = localStorage.getItem('selectedDrink');
    const savedSnack = localStorage.getItem('selectedSnack');
    const savedPeopleCount = localStorage.getItem('peopleCount');

    if (savedPeopleCount) {
        peopleCount = parseInt(savedPeopleCount);
        if (elements.peopleCount) {
            elements.peopleCount.textContent = peopleCount;
        }
    }

    if (savedDrink) {
        const drinkCard = document.getElementById(savedDrink.toLowerCase());
        if (drinkCard) {
            drinkCard.classList.add('selected');
            selectedDrink = DRINK_PACKAGES[savedDrink.toLowerCase()];
        }
    }

    if (savedSnack) {
        const snackCard = document.getElementById(savedSnack.toLowerCase().replace(' ', '-'));
        if (snackCard) {
            snackCard.classList.add('selected');
            selectedSnack = SNACK_PACKAGES[savedSnack.toLowerCase().replace(' ', '-')];
        }
    }

    // Inicialização
    updateMonthDisplay();
    generateDaysGrid();
    updateSelectedItems();
    updatePeopleButtons();
});

// Funções de pagamento
function openPaymentPopup() {
    const popup = document.getElementById('paymentPopup');
    if (popup) {
        popup.classList.remove('hidden');
        popup.classList.add('flex');
    }
}

function closePaymentPopup() {
    const popup = document.getElementById('paymentPopup');
    if (popup) {
        popup.classList.add('hidden');
        popup.classList.remove('flex');
    }
}

function copyPixCode() {
    const pixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000";
    navigator.clipboard.writeText(pixCode).then(() => {
        alert('Código PIX copiado!');
    });
}

function sendToWhatsApp() {
    const nameInput = document.getElementById('name');
    if (!nameInput) return;

    const name = nameInput.value;
    if (!name) {
        alert('Por favor, informe seu nome');
        return;
    }

    const selectedDates = JSON.parse(localStorage.getItem('selectedDates') || '[]');
    const selectedDrink = localStorage.getItem('selectedDrink') || 'Nenhum';
    const selectedSnack = localStorage.getItem('selectedSnack') || 'Nenhum';
    const total = localStorage.getItem('total') || 'R$ 0,00';
    const peopleCount = localStorage.getItem('peopleCount') || '1';

    const formattedDates = selectedDates.map(date => {
        const dateObj = new Date(date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('pt-BR', { month: 'short' });
        return `${day} ${month}`;
    }).join('\n');

    const message = `*Novo Pedido*\n\n` +
        `*Nome:* ${name}\n` +
        `*Quantidade de Pessoas:* ${peopleCount}\n\n` +
        `*Datas Selecionadas:*\n${formattedDates}\n\n` +
        `*Pacote de Bebidas:* ${selectedDrink}\n` +
        `*Pacote de Comidas:* ${selectedSnack}\n` +
        `*Total:* ${total}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/556493024167?text=${encodedMessage}`, '_blank');
}

// Função para alternar a visibilidade das seções
window.toggleSection = function(contentId, arrowId) {
    const content = document.getElementById(contentId);
    const arrow = document.getElementById(arrowId);
    
    if (content && arrow) {
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            arrow.classList.add('rotate-180');
        } else {
            content.classList.add('hidden');
            arrow.classList.remove('rotate-180');
        }
    }
}; 