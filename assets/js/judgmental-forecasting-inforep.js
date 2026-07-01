let JudgmentalForecastingInfo = (function (jspsych) {
    "use strict";

    const info = {
      name: "Judgmental-forecasting",
      parameters: {
        timeouttrial:{
            type:jspsych.ParameterType.INT,
            default: 2000
        },
        seed:{
            type:jspsych.ParameterType.STRING,
            default: "A000"
        },
        refresh_rate:{
            // how frequent will the chart be updated (ms)
            type: jspsych.ParameterType.INT,
            default: 500
        },
        window_len: {
            type: jspsych.ParameterType.INT,
            default: 60
        },
        trace_color: {
            type: jspsych.ParameterType.STRING,
            default: '#000000'
        },
        upper_bound: {
            type: jspsych.ParameterType.INT,
            default: 10
        },
        lower_bound: {
            type: jspsych.ParameterType.INT,
            default: -10
        },
        trial_duration: {
            // how long will the trial last (ms)
            type: jspsych.ParameterType.INT,
            default: 300000
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
        step_size: {
            // the step size of the stock price change
            // the step size is in proportion to the stock price if method == "GBM"
            // the step size is in absolute value if method == "BM"
            type: jspsych.ParameterType.INT,
            default: 0.05,
        },
        extinction_prob: {
            // the probability of extinction
            type: jspsych.ParameterType.FLOAT,
            default: 0.01,
        },
        init_price_min: {
            // the initial price of the stock (token per share)
            type: jspsych.ParameterType.INT,
            default: 50,
        },
        init_price_max: {
            // the initial price of the stock (token per share)
            type: jspsych.ParameterType.INT,
            default: 50,
        },
        trading_cost: {
            // a fixed cost of trading
            type: jspsych.ParameterType.INT,
            default: 3,
        },
        init_shares: {
            // the initial amount of shares that the subject has
            type: jspsych.ParameterType.INT,
            default: 0,
        },
        // init_funds: {
        //     // the initial amount of funds that the subject has
        //     type: jspsych.ParameterType.INT,
        //     default: 200,
        // },
        trade_volume: {
            // the amount of shares that the subject can buy or sell by each decision
            type: jspsych.ParameterType.INT,
            default: 1,
        },
        button_labels: {
            type: jspsych.ParameterType.STRING,
            array: true,
            default: ['SELL']
        },
        move_method : {
            type: jspsych.ParameterType.STRING,
            default: "BM"
        },
        percent_rep:{
            type: jspsych.ParameterType.BOOL,
            default: false
        },
        graphical_rep: {
            type: jspsych.ParameterType.BOOL,
            default: false
        },
        candle_rep: {
            type: jspsych.ParameterType.BOOL,
            default: false
        },
        candle_draws: {
            // the number of draws for each candlestick
            type: jspsych.ParameterType.INT,
            default: 5
        },
        flash_rep: {
            type: jspsych.ParameterType.BOOL,
            default: false
        },
        tabular_rep: {
            type: jspsych.ParameterType.BOOL,
            default: false
        },
        tabular_rows: {
            type: jspsych.ParameterType.INT,
            default: 4
        },
        tabular_cols: {
            type: jspsych.ParameterType.INT,
            default: 15
        },
        urn_rep: {
            type: jspsych.ParameterType.BOOL,
            default: false
        },
        instruction_html: {
            type: jspsych.ParameterType.STRING,
            default: ''
        },
        prior_rep: {
            type: jspsych.ParameterType.BOOL,
            default: false
        },
        prior_good: {
            type: jspsych.ParameterType.INT,
            default: 1
        },
        prior_duration: {
            type: jspsych.ParameterType.INT,
            default: 1500
        },
        exchange_rate: {
            // a multiplier to convert the token into currencies
            type: jspsych.ParameterType.INT,
            default: 1
        }
      },
    };

    /**
     * **Judgmental-Forecasting**
     *
     * This plugin is a faster version of Real-Time-Invest.
     * The participants only make one decision and the trial ends immediately after a response is made.
     * the chart.
     *
     * @author YUYANG DING
     */
    class JudgmentalForecastingInfo {
      constructor(jsPsych) {
        this.jsPsych = jsPsych;
      }
      
      trial(display_element, trial) {
        let new_html = '';
        let init_price = (trial.init_price_min + Math.floor(Math.random() * (trial.init_price_max - trial.init_price_min + 1))) * trial.exchange_rate;
        let contentStyle = trial.prior_rep ? 'display:none' : 'display:block';
        if (trial.prior_rep) {
            new_html += '<div id="prior-label" class="prior-container" style="display:block"><center>Chance of </center><br>Good stock: ' + Math.round(trial.prior_good * 100) + '% &nbsp&nbsp&nbsp&nbsp Bad stock: ' + Math.round((1-trial.prior_good) * 100) + '%    </div>';
        }
        new_html += '<div id="dashboard" class="dashboard-container" style="' + contentStyle + '">';
        new_html += '<div id="open-screen-container" class="dashboard-screen-container">'
        new_html += '<div id="open-screen" class="dashboard-text">COST</div>';
        new_html += '<div id="open" class="dashboard-text">£ ' + (trial.trading_cost * trial.exchange_rate).toFixed(2) + '</div></div>';
        new_html += '<div id="price-screen-container" class="dashboard-screen-container">' // the fund label
        new_html += '<div id="price-screen" class="dashboard-text">PRICE</div>'; // the price label
        if (trial.percent_rep) {
            new_html += '<div class="dashboard-text"><span id="price"></span><span id="deltaprice"></span><span id="deltaprice-proportion"></span></div></div></div>';
        } else {
            new_html += '<div class="dashboard-text"><span id="price"></span></div></div></div>';
        }

        if (trial.graphical_rep) {
            new_html += '<div id="plot" class="plot" style="' + contentStyle + '"></div><br>'; // the div where the stock chart will be shown
        } else if (trial.tabular_rep) {
            new_html += '<table id="table" class="table" style="' + contentStyle + '"><tbody id="table-body"></tbody></table>'; // the div where the stock chart will be shown
        } else {
            new_html += '<div id="placeholder" class="placeholder" style="' + contentStyle + '"></div><br>';
        } // a placeholder that ensures the relative position of the dashboard the same
        new_html += '<div class="button-row-container">';
        new_html += '<div class="button-container" id="start_container" style="display:none"><p id="start_button" class="button-text"; float:"left">Press Enter to Start</p></div>'; // start button
        new_html += '<div class="button-container" id="sell_container" style="display:none"><p id="sell_button" class="button-text"; float:"left">Press Space to ' + trial.button_labels[0] + '</p></div></div>'; // sell button
        // new_html += '<div class="confidence-container"><p>Your decision was <b><span id="decision-reminder"></span></b>. How confident are you in your choice?</p>';
        // new_html += '<div class="confidence-option-container"><div class="confidence-option" id="opt1">1. Not confident at all</div><div class="confidence-option" id="opt2">2. Somewhat confident</div><div class="confidence-option" id="opt3">3. Fairly Confident</div><div class="confidence-option" id="opt4">4. Completely confident</div></div></div>';
        // // new_html += '<input type="range" id="confidence_slider" min="50" max="100" value="50" step="2" list="tickmarks"/>';
        // // new_html += '<datalist id="tickmarker"><option value="50" label="50%"></option><option value="60" label="60%"></option><option value="70" label="70%"></option><option value="80" label="80%"></option><option value="90" label="90%"></option><option value="100" label="100%"></option></datalist>';
        // new_html += '<div id="submit-reminder">Press Enter to continue.</div>';
        display_element.innerHTML = new_html;
        // use the assigned seed to generate the time series
        jsPsych.randomization.setSeed(trial.seed);
        // console.log("Candle draws: " + trial.candle_draws);
        // generate the time series
        // create empty arrays to store info for candlestick chart
        // get the time series for the candlestick chart if applicable
        // if candle_draws == 1, i.e., no candle stick chart, then use initial price as the first data point; otherwise keep the arrays empty
        let full_open = (trial.candle_draws>1)?[]:[(trial.init_price_min + Math.floor(Math.random() * (trial.init_price_max - trial.init_price_min + 1))) * trial.exchange_rate];
        let full_close = (trial.candle_draws>1)?[]:[(trial.init_price_min + Math.floor(Math.random() * (trial.init_price_max - trial.init_price_min + 1))) * trial.exchange_rate];
        let full_high = (trial.candle_draws>1)?[]:[(trial.init_price_min + Math.floor(Math.random() * (trial.init_price_max - trial.init_price_min + 1))) * trial.exchange_rate];
        let full_low = (trial.candle_draws>1)?[]:[(trial.init_price_min + Math.floor(Math.random() * (trial.init_price_max - trial.init_price_min + 1))) * trial.exchange_rate];
        let tmp_price = init_price;
        for (let i = (trial.candle_draws>1)?1:0; i < trial.trial_duration/trial.refresh_rate; i++) {
            let tmp_candle = get_candle(
                trial.candle_draws, 
                tmp_price,
                trial.move_method,
                [trial.change_rate, trial.step_size]);
            full_open.push(Math.round(tmp_candle[0] * 100)/100);
            full_close.push(Math.round(tmp_candle[1] * 100)/100);
            full_high.push(Math.round(tmp_candle[2] * 100)/100);
            full_low.push(Math.round(tmp_candle[3] * 100)/100);
            tmp_price = Math.round(tmp_candle[1] * 100)/100;
        };
        // create the empty table
        if (trial.tabular_rep) {
            const table = document.getElementById('table-body');
            let cellCounter = 0;
            for (let i = 0; i < trial.tabular_rows; i++) {
                const row = document.createElement('tr');
                for (let j = 0; j < trial.tabular_cols; j++) {
                  const cell = document.createElement('td');
                  cell.id = `cell-${cellCounter}`;
                  cell.class = 'cell';
                  if (i == 0 && j == 0) {
                    cell.textContent = init_price;
                  }
                  row.appendChild(cell);
                  cellCounter++;
                }
                table.appendChild(row);
              }
        }

        // sample the extinction time from the geometric distribution of success parameter = extinction_prob
        let extinction_time = Math.ceil(Math.log(1 - Math.random()) / Math.log(1 - trial.extinction_prob));

        let layout = {
            xaxis: {
                title: "Time (seconds)",
                range: [-1, trial.window_len * (trial.refresh_rate/1000) + 2]
            },
            yaxis: {
                title: "Price",
                range: [init_price + trial.lower_bound, init_price + trial.upper_bound]
            },
            size:{
                autosize: false,
                width: 900,
                height: 300,
            },
            margin: {
                t: 40,
                b: 40
            },
            // shapes: [
            //     {
            //       type: 'line',
            //       x0: trial.window_len,
            //       x1: trial.window_len,
            //       y0: 0,
            //       y1: 300,
            //       line: {
            //         color: 'black',
            //         width: 4,
            //         dash: 'dash'
            //       }
            //     }
            //   ],
            showlegend: false
        };
        if (trial.candle_rep) {
            layout.xaxis.rangeslider = {
                visible: false
            };
        };
        let x_main = [1 * (trial.refresh_rate/1000)];
        let x_main_up = [];
        let y_main_up = [];
        let x_main_down = [];
        let y_main_down = [];
        let y_open = full_open.slice(0, 1);
        let y_close = full_close.slice(0, 1);
        let y_high = full_high.slice(0, 1);
        let y_low = full_low.slice(0, 1);


        let trace_up = {
            x: x_main_up,
            y: y_main_up,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'green',
                width: 4},
        };

        let trace_down = {
            x: x_main_down,
            y: y_main_down,
            type: 'scatter',
            mode: 'lines',
            line: {
                color: 'red',
                width: 4},
        };
        
        let trace_candle = {
            x: x_main,
            close: y_close,
            high: y_high,
            low: y_low,
            open: y_open,
            type: 'candlestick',
            decreasing: {line: {color: 'red'}},
            increasing: {line: {color: 'green'}},
            xaxis: 'x',
            yaxis: 'y'
        };

        let traces = [trace_up, trace_down];
        let upper = init_price + trial.upper_bound;
        let lower = init_price + trial.lower_bound;
        // draw the plot
        if (trial.graphical_rep & !(trial.candle_rep)) {
            Plotly.newPlot('plot', traces, layout, {displayModeBar: false, scrollZoom: false, editable: false, staticPlot: true});
        } else if (trial.graphical_rep & trial.candle_rep) {
            Plotly.newPlot('plot', [trace_candle], layout, {displayModeBar: false, scrollZoom: false, editable: false, staticPlot: true});
        };

        let ticksign = '<p id = "ticksign">+'
        let crosssign = '<p id = "crosssign">'
        let misssign = '<p id = "misssign">'

        // tracking the price
        let price = init_price;
        // tracking the price change
        let deltaprice = 0;
        let sumdeltaprice = 0;
        // update the price dashboard
        document.getElementById('price').innerHTML = '£ ' + init_price.toFixed(2);
        if (trial.percent_rep) {
            document.getElementById('deltaprice').innerHTML = " + 0.00";
            document.getElementById('deltaprice-proportion').innerHTML = " (0.00%)";
        };
        // tracking the cost
        let cost = trial.trading_cost * trial.exchange_rate;
        // tracking the shares
        let shares = trial.init_shares;
        // tracking the time/step past
        let t = 0;
        // record an selling response and compute the gain/loss
        let sell = function() {
            if (price < cost) {
                return;
            }
            rt = performance.now() - rt;
            shares = trial.init_shares + trial.trade_volume;
            clearInterval(interval);
            jsPsych.pluginAPI.clearAllTimeouts();
            jsPsych.pluginAPI.cancelAllKeyboardResponses();
            // document.getElementById('decision-reminder').innerHTML = trial.button_labels[0];
            document.getElementById('dashboard').style.display = "none";
            document.getElementsByClassName('button-row-container')[0].style.display = "none";
            // document.getElementsByClassName("confidence-container")[0].style.display = "block";
            let reward = ((price - cost) * shares).toFixed(2);
            let outcome_html = "";
            if (reward >= 0) {
                outcome_html += ticksign + "&nbsp";
                outcome_html += "£ " + reward + "&nbsp";
                outcome_html += "  </p><br/>";
                outcome_html += "<p>Press Space to continue</p><br/>"
                outcome_html += "<button id='show_instruction' class='jspsych-btn'>Show Instructions</button>";
                outcome_html += "<div id='short_instruction'></div>";
            } else {
                outcome_html += crosssign + "&nbsp";
                outcome_html += "£ " + reward + "&nbsp";
                outcome_html += "  </p><br/>";
                outcome_html += "<p>Press Space to continue</p><br/>"
                outcome_html += "<button id='show_instruction' class='jspsych-btn'>Show Instructions</button>";
                outcome_html += "<div id='short_instruction'></div>"
            };
            // let continueButton = document.createElement('button');
            // continueButton.innerHTML = 'Next Stock';
            // continueButton.id = 'too_late_continue_button';
            // continueButton.className = 'jspsych-btn';
            // record the trial data
            let trial_data = {
                seed: trial.seed,
                p: trial.change_rate,
                h: trial.step_size,
                r: trial.extinction_prob,
                x0: trial.init_price_min,
                p0: trial.prior_good,
                extinction_time: extinction_time,
                ticks: t,
                rt: rt,
                response: trial.button_labels[0].toLowerCase(),
                reward: reward,
                price: price,
                cost: cost
            }

            display_element.innerHTML = outcome_html;
            function toggleInstruction() {
                if (document.getElementById('short_instruction').innerHTML == "") {
                    document.getElementById('short_instruction').innerHTML = trial.instruction_html;
                    document.getElementById('show_instruction').innerText = "Hide Instructions";
                }
                else {
                    document.getElementById('short_instruction').innerHTML = "";
                    document.getElementById('show_instruction').innerText = "Show Instructions";
                }
            };
            document.getElementById('show_instruction').addEventListener('click', function() {
                toggleInstruction();
            })

            setTimeout(() => {
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
            
            // display_element.innerHTML += "<p id='too_late_button_p'></p>";
            // document.getElementById('too_late_button_p').appendChild(continueButton);
        };

        // document.getElementById('confidence_slider').addEventListener('input', function(){
        //     document.getElementById('slider_value').innerHTML = document.getElementById('confidence_slider').value;
        // });
        // initialise the RT for later use
        let rt = 0;
        let interval;
        let run_trial_setup = () => {
            // force the participant to spend at least a few seconds on the initial states before starting the trial
            setTimeout(() => {
                document.getElementById('start_container').style.display = "block";
                let enter_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
                    callback_function: startTrial,
                    valid_responses: ['Enter'],
                    persist: false
                });  
            }, trial.timeouttrial);
        };

        if (trial.prior_rep) {
            this.jsPsych.pluginAPI.setTimeout(() => {
                document.getElementById('dashboard').style.display = 'block';
                if(document.getElementById('plot')) document.getElementById('plot').style.display = 'block';
                if(document.getElementById('table')) document.getElementById('table').style.display = 'block';
                if(document.getElementById('placeholder')) document.getElementById('placeholder').style.display = 'block';
                
                run_trial_setup();
            }, trial.prior_duration);
        } else {
            run_trial_setup();
        }  
        
        function updatePlot(t) {
            // const newY = Math.sin(2 * Math.PI * time / 2); // 0.4

            // renew plot
            if (trial.graphical_rep & !(trial.candle_rep)) {

                if (full_close[t] > full_close[t - 1]) {
                    x_main_up.push((t - 1) * (trial.refresh_rate/1000), t * (trial.refresh_rate/1000), null);
                    y_main_up.push(full_close[t - 1], full_close[t], null);
                } else if (full_close[t] < full_close[t - 1]) {
                    x_main_down.push((t - 1) * (trial.refresh_rate/1000), t * (trial.refresh_rate/1000), null);
                    y_main_down.push(full_close[t - 1], full_close[t], null);
                };
    
                let update = {
                    x: [x_main_up, x_main_down],
                    y: [y_main_up, y_main_down]
                };

                Plotly.update('plot', update, {displayModeBar: false, scrollZoom: false, editable: false, staticPlot: true, showlegend: false});
                
                // rescale the axes
                if (full_close[t] >= upper) {
                    upper = Math.ceil(full_close[t]) + trial.step_size * trial.trading_cost * 5;
                    Plotly.relayout('plot', {
                        yaxis: {
                            title: "Price",
                            range: [lower, upper]
                        }
                    });
                } else if (full_close[t] <= lower) {
                    lower = Math.floor(full_close[t]) - trial.step_size * trial.trading_cost * 5;
                    Plotly.relayout('plot', {
                        yaxis: {
                            title: "Price",
                            range: [lower, upper]
                        }
                    });
                };
            } else if (trial.graphical_rep & trial.candle_rep) {

                x_main.push(x_main[x_main.length - 1] + 1 * (trial.refresh_rate/1000));
                y_open = full_open.slice(0, t + 1);
                y_close = full_close.slice(0, t + 1);
                y_high = full_high.slice(0, t + 1);
                y_low = full_low.slice(0, t + 1);
    
                let update = {
                    x: [x_main],
                    close: [y_close],
                    high: [y_high],
                    low: [y_low],
                    open: [y_open]
                };
                
                // rescale the axes
                if (full_high[t] >= upper) {
                    upper = Math.ceil(full_high[t]) + trial.step_size * trial.trading_cost * 5;
                    Plotly.relayout('plot', {
                        yaxis: {
                            title: "Price",
                            range: [lower, upper]
                        }
                    });
                } else if (full_low[t] <= lower) {
                    lower = Math.floor(full_low[t]) - trial.step_size * trial.trading_cost * 5;
                    Plotly.relayout('plot', {
                        yaxis: {
                            title: "Price",
                            range: [lower, upper]
                        }
                    });
                };
    
                // renew plot
                Plotly.update('plot', update);
            };
            // update the x-axis range
            if (trial.graphical_rep) {
                if (t >= trial.window_len - 1) {
                    Plotly.relayout('plot', {
                        xaxis: {
                            title: "Time",
                            range: [0, t * (trial.refresh_rate/1000) + 2],
                            rangeslider: {
                                visible: false
                            }
                            }
                        }
                    )
                };
            };
            // update the price dashboard
            price = full_close[t];
            deltaprice = full_close[t] - full_close[t - 1]
            sumdeltaprice = full_close[t] - init_price;

            document.getElementById('price').innerHTML = "£ " + price.toFixed(2);
            if (trial.percent_rep) {
                if (sumdeltaprice >= 0) {
                    document.getElementById('deltaprice').innerHTML = "+" + sumdeltaprice.toFixed(2);
                    document.getElementById('deltaprice').style.color = "green";
                    document.getElementById('deltaprice-proportion').innerHTML = " (" + (sumdeltaprice/init_price * 100).toFixed(2) + "%)";
                    document.getElementById('deltaprice-proportion').style.color = "green";
                } else {
                    document.getElementById('deltaprice').innerHTML = sumdeltaprice.toFixed(2);
                    document.getElementById('deltaprice').style.color = "red";
                    document.getElementById('deltaprice-proportion').innerHTML = " (" + (sumdeltaprice/init_price * 100).toFixed(2) + "%)";
                    document.getElementById('deltaprice-proportion').style.color = "red"
                };
            };
            // background flash
            if (trial.flash_rep) {
                if (deltaprice >= 0) {
                    document.getElementById('price-screen-container').style.backgroundColor = "rgba(0, 255, 0, 0.3)";
                    setTimeout(() => {
                        document.getElementById('price-screen-container').style.backgroundColor = "white";
                    }, trial.refresh_rate - 100);
                } else {
                    document.getElementById('price-screen-container').style.backgroundColor = "rgba(255, 0, 0, 0.3)";
                    setTimeout(() => {
                        document.getElementById('price-screen-container').style.backgroundColor = "white";
                    }, trial.refresh_rate - 100);
                };
            }

            const sellButton = document.getElementById('sell_button');
            if (price < cost) {
                sellButton.style.color = 'grey';
            } else {
                sellButton.style.color = 'black';
            }
        };

        let updateTable = function(t) {
            const cellId = `cell-${t}`; 
            const currentCell = document.getElementById(cellId);

            if (trial.urn_rep) {
                if (t == 0) {
                    currentCell.innerHTML = full_close[t];
                };
                if (t > 0) {
                    currentCell.innerHTML = full_close[t] > full_close[t - 1] ? '<div class="green-ball"></div>' : '<div class="red-ball"></div>';
                }
            } else {
                currentCell.textContent = full_close[t];
                if (t > 0) {
                    currentCell.className = full_close[t] > full_close[t - 1] ? 'green' : 'red';
                }
            }
        };

        
        function startTrial() {
                // hide the prior label
                if(trial.prior_rep) {
                    document.getElementById('prior-label').style.display = "none";
                }
                // hide the start button
                document.getElementById('start_container').style.display = "none";
                // show the sell button
                document.getElementById('sell_container').style.display = "block";

                let sellListener = setTimeout(() => {
                    jsPsych.pluginAPI.getKeyboardResponse({
                        callback_function: sell,
                        valid_responses: [' '],
                        persist: true
                    });
                }, 500);
                // record the start time
                rt = performance.now();
                // set interval to update the plot in real time
                interval = setInterval(function(){
                // record the ticks
                t++;
                if (t >= extinction_time || t >= trial.trial_duration/trial.refresh_rate) {
                    // end the trial if the extinction is triggered
                    clearInterval(interval);
                    display_element.innerHTML = "";
                    jsPsych.pluginAPI.clearAllTimeouts();
                    jsPsych.pluginAPI.cancelAllKeyboardResponses();
                    shares = trial.init_shares;

                    let reward = 0; // reward = 0 if the trial ends with extinction
                    rt = performance.now() - rt;

                    let trial_data = {
                        seed: trial.seed,
                        p: trial.change_rate,
                        h: trial.step_size,
                        r: trial.extinction_prob,
                        x0: trial.init_price_min,
                        p0: trial.prior_good,
                        extinction_time: extinction_time,
                        ticks: t,
                        rt: rt,
                        response: "delisted",
                        reward: reward,
                        price: price,
                        cost: cost
                    };

                    let outcome_html = ""
                    outcome_html += misssign + "DELISTED<br/><br/>";
                    outcome_html += reward + "&nbsp";
                    outcome_html += "  </p><br/>";
                    outcome_html += "<p>Press Space to continue</p><br/>"
                    outcome_html += "<button id='show_instruction' class='jspsych-btn'>Show Instructions</button>";
                    outcome_html += "<div id='short_instruction'></div>"

                    display_element.innerHTML = outcome_html;
                    function toggleInstruction() {
                        if (document.getElementById('short_instruction').innerHTML == "") {
                            document.getElementById('short_instruction').innerHTML = trial.instruction_html;
                            document.getElementById('show_instruction').innerText = "Hide Instructions";
                        }
                        else {
                            document.getElementById('short_instruction').innerHTML = "";
                            document.getElementById('show_instruction').innerText = "Show Instructions";
                        }
                    };
                    document.getElementById('show_instruction').addEventListener('click', function() {
                        toggleInstruction();
                    })

                    setTimeout(() => {
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
                } else {
                // update the rewards and punishments (if applicable)
                    updatePlot(t);
                    if (trial.tabular_rep) {
                        updateTable(t);
                    };
                };
            }, trial.refresh_rate);
        }
    }};


    JudgmentalForecastingInfo.info = info;

    return JudgmentalForecastingInfo;
    })(jsPsychModule);
