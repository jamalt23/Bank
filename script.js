$('select').selectric();

const mainSwiper = new Swiper('#mainSwiper', {
    speed: 500,
    autoHeight: true,
    grabCursor: true,
    pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
    },
    autoplay: {
        delay: 50000,
    },
});

const $loanForm = $('#loanForm');
$loanForm.find('input:checkbox').on('change', function () {
    $loanForm.find('button:submit').prop('disabled', !this.checked);
});

const $loanRangeSlider0 = $('#loan-range-slider-0');
const $loanRangeSlider1 = $('#loan-range-slider-1');
const $loanRangeSlider2 = $('#loan-range-slider-2');
const $monthlyPayment = $('#monthly-payment');
const $totalPayment = $('#total-payment');
calculateLoan();
function calculateLoan() {
    const amount = $loanRangeSlider0.val();
    const term = $loanRangeSlider1.val();
    const rate = $loanRangeSlider2.val();

    const intr = rate / 1200;
    const result = Math.round(((amount * intr) / (1 - Math.pow(1 / (1 + intr), term))) * 100) / 100;

    $monthlyPayment.text(result);
    $totalPayment.text((result * term).toFixed(2));
}

$('#loan-calculator-section input[type=range]').rangeslider({
    polyfill: false,
    onSlide: function (position, value) {
        const id = this.$range.attr('id').match(/\d/)[0];
        $(`#loan-range-slider-val-${id}`).val(value);
        calculateLoan();
    },
});

$('#loan-calculator-section input[type=text]').on('keydown', (e) => {
    const key = e.originalEvent.key;
    if (key.length == 1) return /\d/.test(key);
    return true;
});

$('#loan-calculator-section input[type=text]').on('input', function () {
    const id = this.id.match(/\d/)[0];
    const $rangeInput = $(`#loan-range-slider-${id}`);
    const min = $rangeInput.prop('min');
    const max = $rangeInput.prop('max');
    const value = +this.value;
    if (!value) {
        this.value = 0;
    } else if (value >= min && value <= max) {
        console.log(this.value, $rangeInput.val());
        $rangeInput.val(value).trigger('change');
    } else if (value > max) {
        this.value = max;
    }
    this.value = parseInt(this.value);
    calculateLoan();
});

const servicesSwiper = new Swiper('#servicesSwiper', {
    spaceBetween: 20,
    breakpoints: {
        0: { slidesPerView: 1.25 },
        768: { slidesPerView: 2.5 },
        992: { slidesPerView: 4 },
    },
});

const rates = {
    USD: { AZN: 1.697 },
    EUR: { AZN: 1.7306 },
    RUB: { AZN: 0.0147 },
    AZN: {
        USD: 0.5875440658049353,
        EUR: 0.5634755169887868,
        RUB: 50.25125628140703,
    },
};

const $exchangePairs = $('.js-currency-calc');
const $currencySelect = $('#converter-section select');
const $sell = $('input[name=sell]');
const $buy = $('input[name=buy]');

function currencyCalculator(rates, selector = 'input', event = 'keyup') {
    if (!$exchangePairs.length) return false;

    $exchangePairs.find(selector).on(event, function (e) {
        const $this = $(this);
        const parent = this.closest('.js-currency-calc');
        const $parent = $(parent);
        const $nextParent = $exchangePairs.index(parent) ? $exchangePairs.first() : $exchangePairs.last();

        const currencyCurrent = $parent.find('select option:checked').val();
        let currencyNext = $nextParent.find('select option:checked').val();

        if (currencyCurrent !== 'AZN' && currencyNext !== 'AZN') {
            $nextParent.find('select').val('AZN');
            currencyNext = 'AZN';
            $currencySelect.selectric('refresh');
        } else if (currencyCurrent === 'AZN' && currencyNext === 'AZN') {
            const previousValue = $this.data('previousValue');
            $nextParent.find('select').val(previousValue);
            currencyNext = previousValue;
            $currencySelect.selectric('refresh');
        }

        if ($this.is('select')) {
            $this.data('previousValue', $this.val());
        }

        const $input = $parent.find('input');
        const inputValue = $input.val();
        if ($input.prop('name') === 'sell') {
            $buy.val(inputValue ? (rates[currencyCurrent][currencyNext] * inputValue).toFixed(4) : '');
        } else if ($input.prop('name') === 'buy') {
            $sell.val(inputValue ? (inputValue / rates[currencyNext][currencyCurrent]).toFixed(4) : '');
        }
    });
}
currencyCalculator(rates);
currencyCalculator(rates, 'select', 'change');
