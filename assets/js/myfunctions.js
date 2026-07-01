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

function plus_minus_k(V, p, h) {
    //generate a random number between 0 and 1
    const random = Math.random();
    // Loop through the outcomes and compare the random number to their probabilities
    if (random < p) {
        return V + h;
    }
    else {
        return V - h;
    };
};

// V = value at time t; p = probability of increasing; h = step size
function geo_plus_minus_k(V, p, h) {
    //generate a random number between 0 and 1
    const random = Math.random();
    // Loop through the outcomes and compare the random number to their probabilities
    if (random < p) {
        return (1 + h)*V;
    }
    else {
        return (1 - h)*V;
    };
};

function get_candle(n_draws = 2, last_close, method, gbm_args) {
    // if (n_draws < 2) {
    //     throw new Error("At least 2 draws are needed.");
    // }
    var draw = [];
    for (var i = 0; i < n_draws; i++) {
        if (method == "BM") {
            draw.push(plus_minus_k(last_close, gbm_args[0], gbm_args[1]));
            last_close = draw[draw.length - 1];
        } else if (method == "GBM") {
            draw.push(geo_plus_minus_k(last_close, gbm_args[0], gbm_args[1]));
            last_close = draw[draw.length - 1];
        } else {
            throw new Error("Unknown method.");
        }
    }
    var open = draw[0];
    var close = draw[draw.length - 1];
    var high = Math.max(...draw);
    var low = Math.min(...draw);
    return [open, close, high, low];
}

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
