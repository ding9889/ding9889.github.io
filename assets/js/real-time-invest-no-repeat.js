let RealTimeInvestFast = (function (jspsych) {
    "use strict";

    const info = {
      name: "real-time-invest-fast",
      parameters: {
        seed:{
            type:jspsych.ParameterType.STRING,
            default: "A000"
        },
        refresh_rate:{
            // how frequent will the chart be updated (ms)
            type: jspsych.ParameterType.INT,
            default: 200
        },
        window_len: {
            type: jspsych.ParameterType.INT,
            default: 50
        },
        trace_color: {
            type: jspsych.ParameterType.STRING,
            default: '#000000'
        },
        upper_bound: {
            type: jspsych.ParameterType.INT,
            default: 200
        },
        lower_bound: {
            type: jspsych.ParameterType.INT,
            default: 0
        },
        trial_duration: {
            // how long will the trial last (ms)
            type: jspsych.ParameterType.INT,
            default: 10000
        },
        feedback_duration: {
            // how long will the feedback (gain/loss) last (ms)
            type: jspsych.ParameterType.INT,
            default: 1000
        },
        change_rate: {
            type: jspsych.ParameterType.INT,
            default: 0.50,
        },
        init_price: {
            // the initial price of the stock (token per share)
            type: jspsych.ParameterType.INT,
            default: 100,
        },
        init_shares: {
            // the initial amount of shares that the subject has
            type: jspsych.ParameterType.INT,
            default: 1,
        },
        init_funds: {
            // the initial amount of funds that the subject has
            type: jspsych.ParameterType.INT,
            default: 150,
        },
        trade_volume: {
            // the amount of shares that the subject can buy or sell by each decision
            type: jspsych.ParameterType.INT,
            default: 1,
        },
        speed_up: {
            // the speed up factor of the stock price change after a decision is made
            // this is for presenting the rest of the time series in a shorter time
            type: jspsych.ParameterType.INT,
            default: 4,
        },
      },
    };

    /**
     * **Real-Time-Investing-Fast**
     *
     * This plugin is a faster version of Real-Time-Invest.
     * The participants only make one decision and the trial ends immediately after a response is made.
     * the chart.
     *
     * @author YUYANG DING
     */
    class RealTimeInvestFast {
      constructor(jsPsych) {
        this.jsPsych = jsPsych;
      }
      trial(display_element, trial) {
        let new_html = '';
        new_html += '<div id="plot" class="plot"></div><br>'; // the div where the stock chart will be shown
        new_html += '<div id="dashboard" class="dashboard-container"><div id="share-screen-container" class="dashboard-screen-container">';
        new_html += '<div id="share-screen" class="dashboard-text">SHARE</div>'; // the share label
        new_html += '<div id="share" class="dashboard-text">' + trial.init_shares + '</div></div>';
        new_html += '<div id="price-screen-container" class="dashboard-screen-container">'
        new_html += '<div id="price-screen" class="dashboard-text">PRICE</div>'; // the price label
        new_html += '<div id="price" class="dashboard-text"></div></div>';
        new_html += '<div id="fund-screen-container" class="dashboard-screen-container">'
        new_html += '<div id="fund-screen" class="dashboard-text">BALANCE</div>'; // the fund label
        new_html += '<div id="fund" class="dashboard-text">' + trial.init_funds + '</div></div></div>';
        new_html += '<div class="button-row-container">';
        new_html += '<div class="button-container"><p id="buy_button" class="button-text";">BUY(Q)</p></div>'; // buy button
        new_html += '<div class="button-container"><p id="sell_button" class="button-text"; float:left">SELL(P)</p></div></div>'; // sell button
        display_element.innerHTML = new_html;
        // use the assigned seed to generate the time series
        jsPsych.randomization.setSeed(trial.seed);
        // generate the time series
        let full_series = [trial.init_price];
        for (let i = 0; i < trial.trial_duration/trial.refresh_rate + 1; i++) {
            full_series.push(full_series[full_series.length - 1] + plus_minus_1(trial.change_rate, 1));
        };

        let layout = {
            xaxis: {
                //title: "Time",
                range: [-1, trial.window_len + 2]
            },
            yaxis: {
                //title: "Price",
                range: [trial.lower_bound, trial.upper_bound]
            },
            size:{
                width: 400,
                height: 400
            },
            margin: {
                t: 40,
                b: 40
            }
        };
        let x_main = [0];
        let y_main = full_series.slice(0, 1);
        let x_start = [0];
        let y_start = [trial.init_price];
        let x_latest = [0];
        let y_latest = [trial.init_price];
        let x_buy = [];
        let y_buy = [];
        let x_sell = []; 
        let y_sell = [];

        let trace_main = {
            x: x_main,
            y: y_main,
            name: 'Trace',
            type: 'scatter',
            mode: 'lines',
            line: {
                color: trial.trace_color,
                width: 4},
            
        };

        // draw the start point
        const trace_start = {
            x: x_start,
            y: y_start,
            name: 'Start',
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
                color: '#808080'
            }
        };

        // draw the latest point
        const trace_latest = {
            x: x_latest,
            y: y_latest,
            name: 'Latest',
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
                color: '#000000'
            }
        };

        let trace_buy = {
            x: x_buy,
            y: y_buy,
            name: 'Buy',
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
                color: '#FF8000'
            }
        };

        let trace_sell = {
            x: x_sell,
            y: y_sell,
            name: 'Sell',
            type: 'scatter',
            mode: 'markers',
            marker: {
                size: 8,
                color: '#0080FF'
            }
        };
        
        let traces = [trace_main, trace_start, trace_latest, trace_buy, trace_sell];
        // draw the plot
        Plotly.newPlot('plot', traces, layout, {displayModeBar: false, scrollZoom: false, editable: false, staticPlot: true});

        let close_msg = '<p id = "close_msg" class = "close_msg">' + "CLOSE PRICE: " + full_series[full_series.length - 1] + '</p><br>';
        let ticksign = '<p id = "ticksign">+'
        let crosssign = '<p id = "crosssign">'
        let misssign = '<p id = "misssign">WINDOW CLOSED</p>'

        // tracking the price
        let price = trial.init_price;
        // tracking the time/step past
        let t = 0;

        // record an buying response and compute the gain/loss
        let buy = function() {
            clearInterval(interval);
            jsPsych.pluginAPI.clearAllTimeouts();
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
            // record the reaction time
            let rt = performance.now() - time;
            let funds = trial.init_funds - price * trial.trade_volume;
            let shares = trial.init_shares + trial.trade_volume;
            // update the dashboard
            document.getElementById('fund').innerHTML = funds;
            document.getElementById('share').innerHTML = shares;
            let buttons = document.getElementsByClassName("button-container");
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].style.visibility = "hidden";
            };
            x_buy.push(x_main[x_main.length - 1]);
            y_buy.push(y_main[y_main.length - 1]);
            // present the rest of the time series in a shorter time
            interval = setInterval(function(){
                t++;
                updatePlot(t);
                if (t >= full_series.length - 1) {
                    clearInterval(interval);
                    let profit = full_series[full_series.length - 1] * shares + funds - trial.init_funds - trial.init_price;
                    let outcome_html = close_msg;
                    if (profit >= 0) {
                        outcome_html += ticksign;
                        outcome_html += profit;
                        outcome_html += "  Token(s) </p><br/>";
                        outcome_html += "<p>Click the button or press Space to continue</p><br/>"
                    } else {
                        outcome_html += crosssign;
                        outcome_html += profit;
                        outcome_html += "  Token(s) </p><br/>";
                        outcome_html += "<p>Click the button or press Space to continue</p><br/>"
                    };
                    let continueButton = document.createElement('button');
                    continueButton.innerHTML = 'Next Stock';
                    continueButton.id = 'too_late_continue_button';
                    continueButton.className = 'jspsych-btn';
                    // record the trial data
                    let trial_data = {
                        seed: trial.seed,
                        change_rate: trial.change_rate,
                        rt: rt,
                        response: "buy",
                        profit: profit,
                        price: price,
                        funds: funds,
                        shares: shares,
                        close_price: full_series[full_series.length - 1]
                    }

                    jsPsych.pluginAPI.setTimeout(() => { 

                        display_element.innerHTML = outcome_html;
                        display_element.innerHTML += "<p id='too_late_button_p'></p>";
                        document.getElementById('too_late_button_p').appendChild(continueButton);
                        
                        jsPsych.pluginAPI.getKeyboardResponse({
                            callback_function: function(){
                                jsPsych.pluginAPI.clearAllTimeouts();
                                jsPsych.pluginAPI.cancelAllKeyboardResponses();
                                display_element.innerHTML = "";
                                jsPsych.finishTrial(trial_data);
                            },
                            valid_responses: [' '],
                            persist: false
                        });

                        continueButton.addEventListener('click', function(){
                            jsPsych.pluginAPI.clearAllTimeouts();
                            // clear the display
                            display_element.innerHTML = "";
                            // cancel the keyboard response listener
                            jsPsych.pluginAPI.cancelAllKeyboardResponses();
                            jsPsych.finishTrial(trial_data);
                        });
                    }, 500);


                };
            }, trial.refresh_rate/trial.speed_up);
        };
        
        // record an selling response and compute the gain/loss
        let sell = function() {
            clearInterval(interval);
            jsPsych.pluginAPI.clearAllTimeouts();
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
            // record the reaction time
            let rt = performance.now() - time;
            let funds = trial.init_funds + price * trial.trade_volume;
            let shares = trial.init_shares - trial.trade_volume;
            // update the dashboard
            document.getElementById('fund').innerHTML = funds;
            document.getElementById('share').innerHTML = shares;
            let profit = full_series[full_series.length - 1] * shares + funds - trial.init_funds - trial.init_price;
            let outcome_html = close_msg;
            if (profit >= 0) {
                outcome_html += ticksign;
                outcome_html += profit;
                outcome_html += "  Token(s) </p><br/>";
                outcome_html += "<p>Click the button or press Space to continue</p><br/>"
            } else {
                outcome_html += crosssign;
                outcome_html += profit;
                outcome_html += "  Token(s) </p><br/>";
                outcome_html += "<p>Click the button or press Space to continue</p><br/>"
            };
            let buttons = document.getElementsByClassName("button-container");
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].style.visibility = "hidden";
            };
            x_sell.push(x_main[x_main.length - 1]);
            y_sell.push(y_main[y_main.length - 1]);
            // present the rest of the time series in a shorter time
            interval = setInterval(function(){
                t++;
                updatePlot(t);
                if (t >= full_series.length - 1) {
                    clearInterval(interval);
                let continueButton = document.createElement('button');
                continueButton.innerHTML = 'Next Stock';
                continueButton.id = 'too_late_continue_button';
                continueButton.className = 'jspsych-btn';
                let trial_data = {
                    seed: trial.seed,
                    change_rate: trial.change_rate,
                    rt: rt,
                    response: "sell",
                    price: price,
                    profit: profit,
                    funds: funds,
                    shares: shares,
                    close_price: full_series[full_series.length - 1]
                };
                // wait for 500ms before everything is cleared
                jsPsych.pluginAPI.setTimeout(() => {                
                    display_element.innerHTML = outcome_html;
                    display_element.innerHTML += "<p id='too_late_button_p'></p>";
                    document.getElementById('too_late_button_p').appendChild(continueButton);
                    
                    jsPsych.pluginAPI.getKeyboardResponse({
                        callback_function: function(){
                            jsPsych.pluginAPI.clearAllTimeouts();
                            jsPsych.pluginAPI.cancelAllKeyboardResponses();
                            display_element.innerHTML = "";
                            jsPsych.finishTrial(trial_data);
                        },
                        valid_responses: [' '],
                        persist: false
                    });

                    continueButton.addEventListener('click', function(){
                        jsPsych.pluginAPI.clearAllTimeouts();
                        // clear the display
                        display_element.innerHTML = "";
                        // cancel the keyboard response listener
                        jsPsych.pluginAPI.cancelAllKeyboardResponses();
                        jsPsych.finishTrial(trial_data);
                    });}, 500);


            };
            }, trial.refresh_rate/trial.speed_up);
        };
        
            let q_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: buy,
                valid_responses: ['q'],
                persist: false
                });
        
            let p_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
                callback_function: sell,
                valid_responses: ['p'],
                persist: false
                });
        
        function updatePlot(t) {
            // const newY = Math.sin(2 * Math.PI * time / 2); // 0.4s
            x_main.push(x_main[x_main.length - 1] + 1);
            y_main = full_series.slice(0, t + 1)

            x_latest = [x_main[x_main.length - 1]];
            y_latest = [y_main[y_main.length - 1]];

            let update = {
                x: [x_main, x_start, x_latest, x_buy, x_sell],
                y: [y_main, y_start, y_latest, y_buy, y_sell]
            };

            // renew plot
            Plotly.update('plot', update);
            price = y_main[y_main.length - 1];
            document.getElementById('price').innerHTML = price;
            }
        
        // record the start time of the trial
        let time = performance.now();
        // set interval to update the plot in real time
        let interval = setInterval(function(){
            t++;
            // update the rewards and punishments (if applicable)
            updatePlot(t);
        }, trial.refresh_rate);
        
        
        jsPsych.pluginAPI.setTimeout(function(){
            clearInterval(interval);
            display_element.innerHTML = "";
            jsPsych.pluginAPI.clearAllTimeouts();
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
            let funds = trial.init_funds + price * trial.trade_volume;
            let shares = trial.init_shares - trial.trade_volume;
            let profit = full_series[full_series.length - 1] * shares + funds - trial.init_funds - trial.init_price;
            // create button
            let continueButton = document.createElement('button');
            continueButton.innerHTML = 'Next Stock';
            continueButton.id = 'too_late_continue_button';
            continueButton.className = 'jspsych-btn';

            let trial_data = {
                seed: trial.seed,
                change_rate: trial.change_rate,
                rt: trial.trial_duration,
                risk: trial.reward_type,
                response: "non-response",
                reward: 0,
                price: price,
                funds: trial.init_funds,
                shares: trial.init_shares,
                close_price: full_series[full_series.length - 1]
            };

            jsPsych.pluginAPI.setTimeout(() => { 
                // end the trial if no response is made before the end of the trial
                let outcome_html = close_msg;
                if (profit >= 0) {
                    outcome_html += ticksign;
                    outcome_html += profit;
                    outcome_html += "  Token(s) </p><br/>";
                    outcome_html += "<p>Click the button or press Space to continue</p><br/>"
                } else {
                    outcome_html += crosssign;
                    outcome_html += profit;
                    outcome_html += "  Token(s) </p><br/>";
                    outcome_html += "<p>Click the button or press Space to continue</p><br/>"
                };
                display_element.innerHTML = outcome_html;
                display_element.innerHTML += "<p id='too_late_button_p'></p>";
                document.getElementById('too_late_button_p').appendChild(continueButton);
            

                jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: function(){
                        jsPsych.pluginAPI.clearAllTimeouts();
                        jsPsych.pluginAPI.cancelAllKeyboardResponses();
                        display_element.innerHTML = "";
                        jsPsych.finishTrial(trial_data);
                    },
                    valid_responses: [' '],
                    persist: false
                });
            }, 500);

            continueButton.addEventListener('click', function(){
                jsPsych.pluginAPI.clearAllTimeouts();
                // clear the display
                display_element.innerHTML = "";
                // cancel the keyboard response listener
                jsPsych.pluginAPI.cancelAllKeyboardResponses();
                jsPsych.finishTrial(trial_data);
            });

        }, trial.trial_duration);
    }};

    RealTimeInvestFast.info = info;

    return RealTimeInvestFast;
    })(jsPsychModule);
