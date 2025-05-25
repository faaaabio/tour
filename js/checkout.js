document.addEventListener('DOMContentLoaded', function() {
    const PRICE_PER_DAY = 199.90;
    const DISCOUNT_THRESHOLD = 2;
    const DISCOUNT_PERCENTAGE = 0.10;
    const MAX_PEOPLE = 4;
    let peopleCount = 1;

    // Controle de quantidade de pessoas
    const decreaseButton = document.getElementById('decreasePeople');
    const increaseButton = document.getElementById('increasePeople');
    const peopleCountElement = document.getElementById('peopleCount');

    function updatePeopleButtons() {
        decreaseButton.disabled = peopleCount <= 1;
        increaseButton.disabled = peopleCount >= MAX_PEOPLE;
    }

    decreaseButton.addEventListener('click', () => {
        if (peopleCount > 1) {
            peopleCount--;
            peopleCountElement.textContent = peopleCount;
            updatePeopleButtons();
            updateSummary();
        }
    });

    increaseButton.addEventListener('click', () => {
        if (peopleCount < MAX_PEOPLE) {
            peopleCount++;
            peopleCountElement.textContent = peopleCount;
            updatePeopleButtons();
            updateSummary();
        }
    });

    // Inicializa os botões
    updatePeopleButtons();

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

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

    function updateMonthDisplay() {
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        document.getElementById('currentMonth').textContent = 
            `${monthNames[currentMonth]} ${currentYear}`;
    }

    function generateDaysGrid() {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const datesGrid = document.getElementById('datesGrid');
        datesGrid.innerHTML = '';

        // Adiciona espaços vazios para os dias antes do primeiro dia do mês
        for (let i = 0; i < startingDay; i++) {
            datesGrid.appendChild(createEmptyDayCell());
        }

        // Adiciona os dias do mês
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const isToday = isSameDay(date, new Date());
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            
            datesGrid.appendChild(createDayCell(date, isToday, isPast));
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

    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
    }

    function updateSummary() {
        const selectedDates = document.querySelectorAll('.date-card.selected');
        const selectedDays = selectedDates.length;
        const subtotal = selectedDays * PRICE_PER_DAY * peopleCount;
        
        // Atualiza a lista de datas selecionadas
        const datesContent = document.getElementById('dates-content');
        const datesCount = document.getElementById('dates-count');
        
        if (selectedDays === 0) {
            datesContent.innerHTML = '<div class="text-sm text-gray-500">Nenhuma data selecionada</div>';
            datesCount.textContent = '0 dias';
        } else {
            datesContent.innerHTML = Array.from(selectedDates)
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
            datesCount.textContent = `${selectedDays} ${selectedDays === 1 ? 'dia' : 'dias'}`;
        }

        // Calcula desconto se aplicável
        let discount = 0;
        if (selectedDays > DISCOUNT_THRESHOLD) {
            discount = subtotal * DISCOUNT_PERCENTAGE;
            document.getElementById('discount-container').classList.remove('hidden');
            document.getElementById('discount-value').textContent = `-${formatCurrency(discount)}`;
        } else {
            document.getElementById('discount-container').classList.add('hidden');
        }

        // Atualiza o total
        const total = subtotal - discount;
        document.getElementById('total-value').textContent = formatCurrency(total);

        // Salva os dados no localStorage
        const dates = Array.from(selectedDates).map(card => card.getAttribute('data-date'));
        localStorage.setItem('selectedDates', JSON.stringify(dates));
        localStorage.setItem('total', formatCurrency(total));
        localStorage.setItem('subtotal', formatCurrency(subtotal));
        localStorage.setItem('discount', formatCurrency(discount));
        localStorage.setItem('peopleCount', peopleCount);
    }

    // Event listeners para navegação entre meses
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateMonthDisplay();
        generateDaysGrid();
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateMonthDisplay();
        generateDaysGrid();
    });

    // Inicialização
    updateMonthDisplay();
    generateDaysGrid();
    updateSummary();

    function updateSelectedDates() {
        const datesContent = document.getElementById('dates-content');
        const datesCount = document.getElementById('dates-count');
        
        if (selectedDates.length === 0) {
            datesContent.innerHTML = '<div class="text-sm text-gray-500">Nenhuma data selecionada</div>';
            datesCount.textContent = '0 dias';
        } else {
            datesContent.innerHTML = selectedDates.map(date => {
                const dateObj = new Date(date);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString('pt-BR', { month: 'short' });
                return `<div class="flex justify-between text-gray-500">
                    <span>${day} ${month}</span>
                    <span>${formatCurrency(PRICE_PER_DAY)}</span>
                </div>`;
            }).join('');
            datesCount.textContent = `${selectedDates.length} ${selectedDates.length === 1 ? 'dia' : 'dias'}`;
        }
    }

    // Função para alternar a visibilidade das seções
    window.toggleSection = function(sectionId) {
        const content = document.getElementById(sectionId);
        const arrow = document.getElementById(sectionId.replace('content', 'arrow'));
        
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            arrow.classList.add('rotate-180');
        } else {
            content.classList.add('hidden');
            arrow.classList.remove('rotate-180');
        }
    };

    // Atualiza a interface inicial
    updateSelectedDates();
}); 