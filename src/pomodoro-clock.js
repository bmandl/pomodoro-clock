import React from 'react';
import './pomodoro-clock.scss';


class BreakLength extends React.Component {

    render() {
        return (
            <div id="break-control" className="duration-control">
                <div id="break-label">Break Length</div>
                <i id="break-decrement" className="icon fas fa-arrow-circle-down" onClick={this.props.handleClick}/>
                <i id="break-increment" className="icon fas fa-arrow-circle-up" onClick={this.props.handleClick}/>
                <div id="break-length">{this.props.breakLength}</div>
            </div>
        );
    }
}

class SessionLength extends React.Component {

    render() {
        return (
            <div id="session-control" className="duration-control">
                <div id="session-label">Session Length</div>
                <i id="session-decrement" className="icon fas fa-arrow-circle-down" onClick={this.props.handleClick} />
                <i id="session-increment" className="icon fas fa-arrow-circle-up" onClick={this.props.handleClick} />
                <div id="session-length">{this.props.sessionLength}</div>
            </div>
        )
    }
}

class Timer extends React.Component {

    render() {
        return (
            <div className="timer-box">
                <div id="timer-label">{this.props.label}</div>
                <div id="time-left">{this.props.timeLeft}</div>
                <div id="start_stop" className="icon" onClick={this.props.startStop}>
                    <i className="fas fa-play" />
                    <i className="fas fa-pause" />
                </div>                
                <div id="reset" onClick={this.props.reset}><i className="icon fas fa-sync-alt" /></div>
            </div>
        );
    }
}

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            paused: true,
            sessionRunning: true,
            breakRunning: false,
            breakModified: false,
            sessionModified: false,
            timerLabel: "Session",
            breakLength: "5",
            sessionLength: "25",
            timeLeft: "25:00"
        }

        this.tick = this.tick.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.toMs = this.toMs.bind(this);
        this.startStop = this.startStop.bind(this);
        this.reset = this.reset.bind(this);

        this.audioPlay = React.createRef();
    }

    componentDidMount() {
        setInterval(() => {
            this.tick();
        }, 1000);
    }

    componentDidUpdate() {
        if (this.state.breakModified || this.state.sessionModified) {
            this.setState(prevState => (
                {
                    sessionModified: false,
                    breakModified: false,
                    timeLeft: prevState.sessionRunning && prevState.sessionModified ?
                        this.formatTime(this.toMs(prevState.sessionLength)) : prevState.breakRunning && prevState.breakModified ?
                            this.formatTime(this.toMs(prevState.breakLength)) : prevState.timeLeft
                }
            ));
        }        
    }

    toMs(string) {
        let minutes = parseInt(string);
        let seconds = string.includes(':') ? parseInt(string.slice(string.indexOf(':') + 1)) : 0;

        return (minutes * 60 + seconds) * 1000;
    }

    formatTime(number) {
        let minutes = '', seconds = '';

        minutes = Math.floor(number / 60000);
        seconds = ((number % 60000) / 1000).toFixed(0);

        return minutes.toString() + ':' + (seconds < 10 ? '0' : '') + seconds.toString();
    }


    tick() {
        if (!this.state.paused) {
            if (this.toMs(this.state.timeLeft) > 0) {
                if (this.state.sessionRunning) {
                    this.setState(prevState => (
                        {
                            timeLeft: this.formatTime(this.toMs(prevState.timeLeft) - 1000)
                        }
                    ));
                }
                else if (this.state.breakRunning) {
                    this.setState(prevState => (
                        {
                            timeLeft: this.formatTime(this.toMs(prevState.timeLeft) - 1000)
                        }
                    ));
                }
                if(this.toMs(this.state.timeLeft) === 0)
                    this.audioPlay.current.play();                
            }

            else if (this.toMs(this.state.timeLeft) === 0) {
                if (this.state.sessionRunning && !this.state.breakRunning) {
                    this.setState(prevState => ({
                        sessionRunning: false,
                        breakRunning: true,
                        timeLeft: this.formatTime(this.toMs(prevState.breakLength)),
                        timerLabel: "Break"
                    }));
                }
                else if (this.state.breakRunning && !this.state.sessionRunning) {
                    this.setState(prevState => ({
                        sessionRunning: true,
                        breakRunning: false,
                        timeLeft: this.formatTime(this.toMs(prevState.sessionLength)),
                        timerLabel: "Session"
                    }));
                }
                this.audioPlay.current.pause();
                this.audioPlay.current.currentTime = 0;
            }
        }
    }

    handleClick(e) {
        let operation = e.target.id;
        if (this.state.paused) {
            this.setState(prevState => (
                {
                    breakLength:
                        operation === 'break-decrement' && this.toMs(prevState.breakLength) > 60000 ?
                            ((this.toMs(prevState.breakLength) - 60000) / 60000).toString() : operation === 'break-increment' && this.toMs(prevState.breakLength) < 60000 * 60 ?
                                ((this.toMs(prevState.breakLength) + 60000) / 60000).toString() : prevState.breakLength,
                    sessionLength:
                        operation === 'session-decrement' && this.toMs(prevState.sessionLength) > 60000 ?
                            ((this.toMs(prevState.sessionLength) - 60000) / 60000).toString() : operation === 'session-increment' && this.toMs(prevState.sessionLength) < 60000 * 60 ?
                                ((this.toMs(prevState.sessionLength) + 60000) / 60000).toString() : prevState.sessionLength,
                    breakModified: operation.includes("break") ? true : false,
                    sessionModified: operation.includes("session") ? true : false
                }
            ));
        }
    }

    startStop(e) {
        this.setState(prevState => (
            {
                paused: !prevState.paused
            }
        ));
    }

    reset(e) {
        this.setState(
            {
                paused: true,
                sessionRunning: true,
                breakRunning: false,
                timerLabel: "Session",
                breakLength: "5",
                sessionLength: "25",
                timeLeft: "25:00"
            }
        )
        this.audioPlay.current.pause();
        this.audioPlay.current.currentTime = 0;
    }

    render() {

        return (
            <div id="Container">
                <h1 id="app-title">Pomodoro clock</h1>
                <BreakLength handleClick={this.handleClick} breakLength={this.state.breakLength} />
                <SessionLength handleClick={this.handleClick} sessionLength={this.state.sessionLength} />
                <Timer timeLeft={this.state.timeLeft} startStop={this.startStop} reset={this.reset} label={this.state.timerLabel} />
                <audio id="beep" src="https://goo.gl/65cBl1" ref={this.audioPlay} />
            </div>
        );
    }
}
        
    

export default App;