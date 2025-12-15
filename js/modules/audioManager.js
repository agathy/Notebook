// 音频与录音管理模块
// 依赖：window.userSettings 与全局 showMessage（由主入口提供）

const getUserSettings = () => window.userSettings || { learningLanguages: [] };
const getShowMessage = () => window.showMessage || (() => {});

// 录音/播放状态
export let mediaRecorder = null;
export let audioChunks = [];
export let recordingLangCode = null;
export let currentAudio = null;           // 正在播放的音频
export let recordedAudios = {};           // { langCode: base64Audio }

// 对外提供清空录音的方法（表单重置时可调用）
export function resetRecordedAudios() {
    recordedAudios = {};
}

// 初始化发音与录音相关的按钮事件
export function setupAudioFeatures() {
    // 为每个学习语言添加播放与录音按钮事件
    getUserSettings().learningLanguages.forEach(langCode => {
        const playBtn = document.getElementById(`${langCode}-play-audio`);
        const recordBtn = document.getElementById(`${langCode}-record-audio`);
        const wordInput = document.getElementById(`${langCode}-word`);

        // 播放按钮
        if (playBtn) {
            playBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const text = wordInput ? wordInput.value.trim() : '';
                if (!text) return;
                const userAudio = recordedAudios[langCode] || null;
                await playWordAudio(text, langCode, userAudio);
            });
        }

        // 录音按钮
        if (recordBtn) {
            recordBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (recordingLangCode === langCode) {
                    stopRecording(langCode);
                } else {
                    await startRecording(langCode);
                }
            });
        }

        // 输入时控制播放按钮显示
        if (wordInput && playBtn) {
            wordInput.addEventListener('input', function() {
                playBtn.style.display = this.value.trim() ? 'inline-flex' : 'none';
            });
        }
    });
}

// 播放单词发音（优先用户录音）
export async function playWordAudio(text, langCode, userAudio = null) {
    // 停止当前播放
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (window.speechSynthesis && speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    // 用户录音优先
    if (userAudio) {
        try {
            currentAudio = new Audio(userAudio);
            await currentAudio.play();
            currentAudio.onended = () => currentAudio = null;
            currentAudio.onerror = () => playAIAudio(text, langCode);
            return;
        } catch (err) {
            console.error('播放用户录音失败:', err);
        }
    }

    // 回退到 AI 发音
    playAIAudio(text, langCode);
}

// 使用浏览器 TTS 发音
export function playAIAudio(text, langCode) {
    const showMessage = getShowMessage();
    if (!('speechSynthesis' in window)) {
        showMessage('您的浏览器不支持语音合成功能', 'error');
        return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const langMap = { zh: 'zh-CN', en: 'en-US', ko: 'ko-KR', es: 'es-ES' };
    utterance.lang = langMap[langCode] || langCode;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    speechSynthesis.speak(utterance);
}

// 开始录音
export async function startRecording(langCode) {
    try {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        recordingLangCode = langCode;

        const recordBtn = document.getElementById(`${langCode}-record-audio`);
        if (recordBtn) {
            recordBtn.classList.add('recording');
            recordBtn.innerHTML = '<i class="fas fa-stop"></i>';
            recordBtn.title = '停止录音';
        }

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Audio = reader.result;
                saveRecording(langCode, base64Audio);
            };
            reader.readAsDataURL(audioBlob);
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        getShowMessage()('开始录音...', 'info');
    } catch (error) {
        console.error('录音失败:', error);
        getShowMessage()('无法访问麦克风，请检查权限设置', 'error');
    }
}

// 停止录音
export function stopRecording(langCode) {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        recordingLangCode = null;
        const recordBtn = document.getElementById(`${langCode}-record-audio`);
        if (recordBtn) {
            recordBtn.classList.remove('recording');
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            recordBtn.title = '录音';
        }
        getShowMessage()('录音完成', 'success');
    }
}

// 保存录音到内存（调用方在保存单词时写入 words 数据结构）
export function saveRecording(langCode, audioData) {
    recordedAudios[langCode] = audioData;
    const audioBadge = document.getElementById(`${langCode}-audio-badge`);
    if (audioBadge) {
        audioBadge.style.display = 'inline-block';
    }
}
