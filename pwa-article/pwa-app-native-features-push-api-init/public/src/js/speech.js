const startButton = (event) => {
    if (recognizing) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    title.innerHTML = '';
    interim_span.innerHTML = '';
    start_img.src = './src/images/mic-slash.gif';
    showInfo('info_allow');
    start_timestamp = event.timeStamp;
};

const showInfo = (s) => {
    if (s) {
        for (let child = info.firstChild; child; child = child.nextSibling) {
            if (child.style) {
                child.style.display = child.id == s ? 'inline' : 'none';
            }
        }
        info.style.visibility = 'visible';
    } else {
        info.style.visibility = 'hidden';
    }
};

const updateCountry = () => {
    for (let i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    let list = langs[select_language.selectedIndex];
    for (let i = 1; i < list.length; i++) {
        select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
};

const upgrade = () => {
    start_button.style.visibility = 'hidden';
    showInfo('info_upgrade');
};

const two_line = /\n\n/g;
const one_line = /\n/g;
const linebreak = (s) => {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
};

const first_char = /\S/;
const capitalize = (s) => {
    return s.replace(first_char, (m) => { return m.toUpperCase(); });
};

for (let i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 6;

updateCountry();
select_dialect.selectedIndex = 6;

showInfo('info_start');

let final_transcript = '';
let recognizing = false;
let ignore_onend;
let start_timestamp;
let recognition;
if ('webkitSpeechRecognition' in window) {
    start_button.style.display = 'inline-block';
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
        recognizing = true;
        showInfo('info_speak_now');
        start_img.src = './src/images/mic-animate.gif';
    };

    recognition.onresult = (event) => {
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_transcript = capitalize(final_transcript);
        title.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);

    };

    recognition.onend = () => {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
        start_img.src = './src/images/mic.gif';
        showInfo('');
    };

    recognition.onerror = (event) => {
        if (event.error == 'no-speech') {
            start_img.src = '../src/images/mic.gif';
            showInfo('info_no_speech');
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            start_img.src = '../src/images/mic.gif';
            showInfo('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
            } else {
                showInfo('info_denied');
            }
            ignore_onend = true;
        }
    };
} else {
    upgrade();
}
