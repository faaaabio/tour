document.addEventListener('DOMContentLoaded', function() {
    const PRICE_PER_DAY = 299.90;
    const DISCOUNT_THRESHOLD = 2;
    const DISCOUNT_PERCENTAGE = 0.10;

    // Variáveis para armazenar os itens selecionados
    let selectedDrink = null;
    let selectedSnack = null;

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

    // Recupera os dados do localStorage
    const selectedDates = JSON.parse(localStorage.getItem('selectedDates') || '[]');
    const total = localStorage.getItem('total') || 'R$ 0,00';
    const discount = localStorage.getItem('discount') || 'R$ 0,00';
    const subtotal = localStorage.getItem('subtotal') || 'R$ 0,00';

    // Atualiza a interface com os dados recuperados
    const datesContainer = document.getElementById('selected-dates');
    const datesCount = document.getElementById('dates-count');
    
    if (selectedDates.length === 0) {
        datesCount.textContent = '0 dias';
    } else {
        datesCount.textContent = `${selectedDates.length} ${selectedDates.length === 1 ? 'dia' : 'dias'}`;
    }

    // Atualiza o total e desconto
    document.getElementById('total-value').textContent = total;
    if (discount !== 'R$ 0,00') {
        document.getElementById('discount-container').classList.remove('hidden');
        document.getElementById('discount-value').textContent = `-${discount}`;
    }

    function formatCurrency(value) {
        return `R$ ${value.toFixed(2)}`;
    }

    function updateSelectedItems() {
        const selectedDrinks = document.getElementById('selected-drinks');
        const selectedSnacks = document.getElementById('selected-snacks');
        const drinkName = document.getElementById('drink-name');
        const drinkPrice = document.getElementById('drink-price');
        const snackName = document.getElementById('snack-name');
        const snackPrice = document.getElementById('snack-price');

        // Atualiza bebidas selecionadas
        if (selectedDrink) {
            selectedDrinks.classList.remove('hidden');
            drinkName.textContent = selectedDrink.name;
            drinkPrice.textContent = formatCurrency(selectedDrink.price);
        } else {
            selectedDrinks.classList.add('hidden');
        }

        // Atualiza comidas selecionadas
        if (selectedSnack) {
            selectedSnacks.classList.remove('hidden');
            snackName.textContent = selectedSnack.name;
            snackPrice.textContent = formatCurrency(selectedSnack.price);
        } else {
            selectedSnacks.classList.add('hidden');
        }

        updateTotal();
    }

    function updateTotal() {
        const datesTotal = selectedDates.length * PRICE_PER_DAY;
        let drinkTotal = selectedDrink ? selectedDrink.price : 0;
        let snackTotal = selectedSnack ? selectedSnack.price : 0;

        const subtotal = datesTotal + drinkTotal + snackTotal;
        let discount = 0;
        
        if (selectedDates.length > DISCOUNT_THRESHOLD) {
            discount = datesTotal * DISCOUNT_PERCENTAGE;
            document.getElementById('discount-container').classList.remove('hidden');
            document.getElementById('discount-value').textContent = `-${formatCurrency(discount)}`;
        } else {
            document.getElementById('discount-container').classList.add('hidden');
        }

        const total = subtotal - discount;
        document.getElementById('total-value').textContent = formatCurrency(total);

        // Atualiza o localStorage
        localStorage.setItem('total', formatCurrency(total));
        localStorage.setItem('subtotal', formatCurrency(subtotal));
        localStorage.setItem('discount', formatCurrency(discount));
        localStorage.setItem('selectedDrink', selectedDrink ? selectedDrink.name : '');
        localStorage.setItem('selectedSnack', selectedSnack ? selectedSnack.name : '');
        localStorage.setItem('drinkPrice', selectedDrink ? formatCurrency(selectedDrink.price) : 'R$ 0,00');
        localStorage.setItem('snackPrice', selectedSnack ? formatCurrency(selectedSnack.price) : 'R$ 0,00');
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

    // Atualiza as datas selecionadas
    function updateSelectedDates() {
        const datesContent = document.getElementById('dates-content');
        datesContent.innerHTML = selectedDates.map(date => {
            const dateObj = new Date(date);
            const day = dateObj.getDate();
            const month = dateObj.toLocaleString('pt-BR', { month: 'short' });
            return `<div class="flex justify-between text-gray-500">
                <span>${day} ${month}</span>
                <span>${formatCurrency(PRICE_PER_DAY)}</span>
            </div>`;
        }).join('');
    }

    // Atualiza a interface inicial
    updateSelectedDates();
    updateSelectedItems();
});

function openPaymentPopup() {
    document.getElementById('paymentPopup').classList.remove('hidden');
    document.getElementById('paymentPopup').classList.add('flex');
}

function closePaymentPopup() {
    document.getElementById('paymentPopup').classList.add('hidden');
    document.getElementById('paymentPopup').classList.remove('flex');
}

function copyPixCode() {
    const pixCode = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000";
    navigator.clipboard.writeText(pixCode).then(() => {
        alert('Código PIX copiado!');
    });
}

function sendToWhatsApp() {
    const name = document.getElementById('name').value;
    
    if (!name) {
        alert('Por favor, informe seu nome');
        return;
    }

    const selectedDates = JSON.parse(localStorage.getItem('selectedDates') || '[]');
    const selectedDrink = localStorage.getItem('selectedDrink') || 'Nenhum';
    const selectedSnack = localStorage.getItem('selectedSnack') || 'Nenhum';
    const total = localStorage.getItem('total') || 'R$ 0,00';

    // Formata as datas para exibição
    const formattedDates = selectedDates.map(date => {
        const dateObj = new Date(date);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('pt-BR', { month: 'short' });
        return `${day} ${month}`;
    }).join('\n');

    const message = `*Novo Pedido*\n\n` +
        `*Nome:* ${name}\n\n` +
        `*Datas Selecionadas:*\n${formattedDates}\n\n` +
        `*Pacote de Bebidas:* ${selectedDrink}\n` +
        `*Pacote de Comidas:* ${selectedSnack}\n` +
        `*Total:* ${total}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/556493024167?text=${encodedMessage}`, '_blank');
} 