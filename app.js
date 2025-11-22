/**
 * AntiGen Application Logic
 * Version: 11.0 (Pro Tools)
 */

const App = {
    // 應用狀態
    state: {
        isGenerating: false,
        progress: 0,
        progressInterval: null
    },

    // UI 元素緩存
    ui: {
        promptInput: document.getElementById('prompt-input'),
        generateBtn: document.getElementById('generate-btn'),
        imageShowcase: document.getElementById('image-showcase'),
        generatedImage: document.getElementById('generated-image'),
        imageLoading: document.getElementById('image-loading'),
        placeholder: document.querySelector('.placeholder-content'),
        progressBar: document.getElementById('progress-bar'),
        progressText: document.getElementById('progress-text'),
        // Pro Tools
        ratioSelect: document.getElementById('ratio-select'),
        styleSelect: document.getElementById('style-select'),
        enhanceToggle: document.getElementById('enhance-toggle')
    },

    // 初始化
    init() {
        console.log('AntiGen v11 initializing...');
        this.bindEvents();
        this.ui.promptInput.focus();
    },

    // 綁定事件
    bindEvents() {
        this.ui.generateBtn.addEventListener('click', () => this.generateImage());
        this.ui.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateImage();
        });

        // 當比例改變時，調整預覽框的比例
        this.ui.ratioSelect.addEventListener('change', (e) => {
            this.updateAspectRatio(e.target.value);
        });
    },

    // 更新畫布比例
    updateAspectRatio(ratio) {
        let aspectRatio = '1/1';
        if (ratio === '16:9') aspectRatio = '16/9';
        if (ratio === '9:16') aspectRatio = '9/16';
        if (ratio === '4:3') aspectRatio = '4/3';

        this.ui.imageShowcase.style.aspectRatio = aspectRatio;
    },

    // 模擬進度條
    simulateProgress() {
        this.state.progress = 0;
        this.updateProgressUI();

        if (this.state.progressInterval) clearInterval(this.state.progressInterval);

        // 模擬非線性進度
        // 1. 快速啟動 (0-30%)
        // 2. 思考與生成 (30-80%)
        // 3. 細節修飾 (80-95%)
        // 4. 完成 (100%)

        const phases = [
            { end: 30, duration: 2000, msg: "正在構思構圖..." },
            { end: 60, duration: 10000, msg: "正在描繪輪廓..." },
            { end: 85, duration: 10000, msg: "正在光影渲染..." },
            { end: 95, duration: 10000, msg: "正在修飾細節..." }
        ];

        let currentPhase = 0;
        let startTime = Date.now();
        let startProgress = 0;

        this.state.progressInterval = setInterval(() => {
            if (this.state.progress >= 99) return;

            const phase = phases[currentPhase];
            const now = Date.now();
            const elapsed = now - startTime;

            // 計算當前階段的進度
            let progressInPhase = elapsed / phase.duration;

            if (progressInPhase >= 1) {
                // 進入下一階段
                this.state.progress = phase.end;
                currentPhase++;
                if (currentPhase >= phases.length) {
                    currentPhase = phases.length - 1; // 停在最後階段
                } else {
                    startTime = Date.now();
                    startProgress = this.state.progress;
                    // 更新狀態文字
                    this.ui.progressText.textContent = `${phases[currentPhase].msg} ${Math.floor(this.state.progress)}%`;
                }
            } else {
                // 線性插值
                const targetProgress = startProgress + (phase.end - startProgress) * progressInPhase;
                this.state.progress = targetProgress;

                // 隨機微調，讓跑條看起來更自然
                if (Math.random() > 0.5) {
                    this.state.progress += (Math.random() * 0.5);
                }
            }

            this.updateProgressUI();
        }, 100);
    },

    updateProgressUI() {
        const percentage = Math.min(99, Math.floor(this.state.progress));
        this.ui.progressBar.style.width = `${percentage}%`;
        // 如果還沒進入下一階段的文字更新，保持原本的
        if (!this.ui.progressText.textContent.includes("正在")) {
            this.ui.progressText.textContent = `AI 正在繪圖中... ${percentage}%`;
        } else {
            // 只更新百分比
            const currentMsg = this.ui.progressText.textContent.split(' ')[0];
            this.ui.progressText.textContent = `${currentMsg} ${percentage}%`;
        }
    },

    async generateImage() {
        const prompt = this.ui.promptInput.value.trim();

        if (!prompt) {
            alert('請輸入提示詞');
            return;
        }

        if (this.state.isGenerating) return;

        this.state.isGenerating = true;
        this.ui.generateBtn.disabled = true;
        this.ui.generateBtn.innerHTML = '<div class="loading-spinner" style="width: 20px; height: 20px; border-width: 2px;"></div> 生成中...';

        this.ui.imageLoading.classList.remove('hidden');
        this.ui.placeholder.classList.add('hidden');
        this.ui.imageShowcase.classList.add('has-image');

        // 開始模擬進度
        this.simulateProgress();

        // 設定 40 秒超時 (Flux 比較慢)
        const timeoutId = setTimeout(() => {
            if (this.state.isGenerating) {
                console.log('Generation timed out');
                this.resetGenerationState();
                alert('生成時間較長，請稍後再試。');
                if (this.ui.generatedImage.classList.contains('hidden')) {
                    this.ui.placeholder.classList.remove('hidden');
                    this.ui.imageShowcase.classList.remove('has-image');
                }
                this.ui.imageLoading.classList.add('hidden');
            }
        }, 40000);

        try {
            // 取得 Pro Tools 參數
            const ratio = this.ui.ratioSelect.value;
            const style = this.ui.styleSelect.value;
            const enhance = this.ui.enhanceToggle.checked;

            let width = 1024;
            let height = 1024;

            if (ratio === '16:9') { width = 1280; height = 720; }
            if (ratio === '9:16') { width = 720; height = 1280; }
            if (ratio === '4:3') { width = 1024; height = 768; }

            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(prompt);

            // 建構 URL
            let imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=${width}&height=${height}&nologo=true`;

            // 加入模型參數
            if (style !== 'flux') {
                imageUrl += `&model=${style}`;
            } else {
                imageUrl += `&model=flux`;
            }

            // 加入優化參數
            if (enhance) {
                imageUrl += `&enhance=true`;
            }

            const img = new Image();

            img.onload = () => {
                clearTimeout(timeoutId);
                clearInterval(this.state.progressInterval);

                this.state.progress = 100;
                this.ui.progressBar.style.width = '100%';
                this.ui.progressText.textContent = '生成完成！ 100%';

                setTimeout(() => {
                    this.ui.generatedImage.src = imageUrl;
                    this.ui.generatedImage.classList.remove('hidden');
                    this.ui.imageLoading.classList.add('hidden');
                    this.resetGenerationState();
                }, 500);
            };

            img.onerror = () => {
                clearTimeout(timeoutId);
                clearInterval(this.state.progressInterval);
                alert('圖片生成失敗，請稍後再試');
                this.ui.imageLoading.classList.add('hidden');

                if (this.ui.generatedImage.src === '' || this.ui.generatedImage.classList.contains('hidden')) {
                    this.ui.placeholder.classList.remove('hidden');
                    this.ui.imageShowcase.classList.remove('has-image');
                }

                this.resetGenerationState();
            };

            img.src = imageUrl;

        } catch (error) {
            clearTimeout(timeoutId);
            clearInterval(this.state.progressInterval);
            console.error('Generation error:', error);
            this.resetGenerationState();
        }
    },

    resetGenerationState() {
        this.state.isGenerating = false;
        this.state.progress = 0;
        if (this.state.progressInterval) clearInterval(this.state.progressInterval);
        this.ui.generateBtn.disabled = false;
        this.ui.generateBtn.innerHTML = '<span>✨ 生成</span>';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
