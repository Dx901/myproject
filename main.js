//These are the components of the timer
const timer = {
    pomodoro: 25,
    shortBreak:5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0, //Keeps tracks of the seesions that have been completed
};
//once each of the buttons is pressed
//Create an eventListener to detect a click
//create a function to switch the mode of the timer appropriately

let interval;
const buttonSound = new Audio('button-sound.mp3')
const mainButton = document.getElementById('js-btn')
mainButton.addEventListener('click', () => {
    //The value of the data action is checked
    //If the value is start then then the starttimer()
    //function is invoked
    buttonSound.play() //call sound to play when button is pressed
    const {action} = mainButton.dataset
    if (action === 'start') {
        startTimer()
    }else{
        stopTimer();
    }
    
});
const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode)

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference/1000, 10);
    const minutes = Number.parseInt((total/60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}


function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    if (timer.mode === 'pomodoro')timer.sessions++
    
    //This is retreiving
    //the current time
//Before starting the timer we need to know when it will end
    mainButton.dataset.action = 'stop'
    mainButton.textContent = 'stop'
    mainButton.classList.add('active')

    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(interval)

            switch (timer.mode) {
                case 'pomodoro':
                    //This checks if the timer.sessions is didvisible by 
                    //timer.longBreakInterval without a remainder and switches
                    //to long break, otherwise a shortbreak session is triggered
                    if (timer.sessions % timer.longBreakInterval === 0) {
                        switchMode('longBreak')
                    }else {
                        switchMode('shortBreak')
                    }
                    break
                default:
                    switchMode('pomodoro')
            }
            if (Notification.permission === 'granted') {
                const text =
                    timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break! You deserve it'
                    new Notification(text)
            }
            document.querySelector(`[data-sound="${timer.mode}"]`).play()

            startTimer()
        }
    }, 1000)
}

//Stopping the timer 
function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
} 

//Next is the function that shows how the countdown
//portion is updated
function updateClock() {
    //Extracts the value of the minutes and the seconds properties
    //and pads them with zeros where necessary
    const {remainingTime} = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0')

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;

    const text = timer.mode === 'pomodoro' ? 'Get back to work' : 'Take a break'
    document.title = `${minutes}: ${seconds} - ${text}`

    const progress = document.getElementById('js-progress')
    progress.value = timer[timer.mode]*60 - timer.remainingTime.total
}

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60, //Total time remaining in seconds
        minutes: timer[mode],//This is the number of minutes for the mode
        seconds: 0 //Always 0 at the start of a session
    };

    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active')
    document.body.style.backgroundColor = `var(--${mode})`;

    document
        .getElementById('js-progress')
        .setAttribute('max', timer.remainingTime.total)

    updateClock()
}

function handleMode(event) {
    const {mode} = event.target.dataset;

    if (!mode) return;
    switchMode(mode);
    stopTimer();
}
document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        //If notification permissions are neither granted nor denied
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            //Ask user for permission
            Notification.requestPermission().then(function(permission) {
                 //If permissin is granted
                if (permission === "granted") {
                
                    new Notification(
                        "Awesome! Dyes will notify you at the start of each session"
                    )
                }
            })
        }
    }
    switchMode('pomodoro');
});
