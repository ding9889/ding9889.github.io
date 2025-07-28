// preload data
var full_data = [];
var getFile = function(url) {
    let xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, false);
    xhttp.onload = function() {
        full_data = this.responseText;
    };
    xhttp.send();
};

// python-like range() function
function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }

    if (typeof step == 'undefined') {
        step = 1;
    }

    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }

    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }

    return result;
};

function find_next(data, start) {
    return data[start];
};

function random_draw(list, list_len) {
    return list[Math.floor(Math.random()*list_len)];
};

function random_draw_stock(data, stock_num, time_period, pos, price_pos, id_pos, trend_pos) {
    // the default order is ['id','time','price','trend']
    if (typeof pos == 'undefined') {
        id_pos = 0;
        price_pos = 2;
        trend_pos = 3;
    };

    var stock_list = range(stock_num);
    var selected_stock = random_draw(stock_list, stock_list.length);
    var result = [];
    var start = selected_stock * time_period + 1;
    var end = (selected_stock + 1) * time_period;
    for (var i = start; i <= end; i++) {
        var price = data[i][price_pos];
        result.push(price);
    };
    var code = "00" + data[start][id_pos] + data[start][trend_pos];
    return {[code]:result};
};
// this function will return either step_len (with prob=prob1) or -step_len(with prob=1-prob1)
function plus_minus_1(prob1, step_len) {
    //generate a random number between 0 and 1
    const random = Math.random();
    // Loop through the outcomes and compare the random number to their probabilities
    if (random < prob1) {
        return step_len;
    }
    else {
        return -step_len;
    };
};

function getSelectedValues() {
    const selectedValues = [];
    const questions = document.querySelectorAll('.question');
    questions.forEach((question) => {
        const radioGroup = question.querySelectorAll('input[type="radio"]');
        radioGroup.forEach((radio) => {
            if (radio.checked) {
                selectedValues.push(radio.value);
            }
        });
    });
    return selectedValues;
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
