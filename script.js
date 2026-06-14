// ===== AI 副业工具箱 - Main JavaScript =====

// ---- State ----
let aiConfig = {
    provider: localStorage.getItem('ai_provider') || 'deepseek',
    apiKey: localStorage.getItem('ai_api_key') || '',
    endpoint: localStorage.getItem('ai_endpoint') || '',
    model: localStorage.getItem('ai_model') || ''
};
let isGenerating = false;

// ---- Provider Presets ----
const providerPresets = {
    deepseek: {
        name: 'DeepSeek',
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat',
        keyHint: 'sk-...',
        format: 'openai',
        registerUrl: 'https://platform.deepseek.com/',
        desc: '国产 · 推荐 · ¥1/百万tokens'
    },
    qwen: {
        name: '通义千问',
        endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        model: 'qwen-plus',
        keyHint: 'sk-...',
        format: 'openai',
        registerUrl: 'https://dashscope.aliyun.com/',
        desc: '阿里云 · 新用户免费额度'
    },
    glm: {
        name: '智谱GLM',
        endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        model: 'glm-4-flash',
        keyHint: '...',
        format: 'openai',
        registerUrl: 'https://open.bigmodel.cn/',
        desc: '国产 · 新用户送¥18'
    },
    claude: {
        name: 'Claude',
        endpoint: 'https://api.anthropic.com/v1/messages',
        model: 'claude-sonnet-4-6',
        keyHint: 'sk-ant-...',
        format: 'anthropic',
        registerUrl: 'https://console.anthropic.com/',
        desc: 'Anthropic · 需翻墙'
    },
    custom: {
        name: '自定义',
        endpoint: '',
        model: '',
        keyHint: '输入你的 Key',
        format: 'openai',
        registerUrl: '',
        desc: '自定义 API 地址和模型'
    }
};

function getPreset() {
    return providerPresets[aiConfig.provider] || providerPresets.deepseek;
}

function getEndpoint() {
    return aiConfig.endpoint || getPreset().endpoint;
}

function getModel() {
    return aiConfig.model || getPreset().model;
}

// ---- Prompt Library Data ----
const promptLibrary = [
    {
        id: 1,
        category: '写作',
        title: '公众号爆款文章',
        preview: '你是一位资深公众号主编。请根据以下主题写一篇吸引人的公众号文章...',
        full: `你是一位资深公众号主编，擅长创作10w+爆款文章。

请根据以下信息写一篇公众号文章：
- 主题：{topic}
- 目标读者：{audience}
- 字数：1500-2000字
- 风格：{style}

要求：
1. 标题要有悬念感和点击欲
2. 开头用故事或数据抓人
3. 正文分3-4个小标题
4. 每个观点配案例
5. 结尾引导关注和转发
6. 排版用短句，适合手机阅读`
    },
    {
        id: 2,
        category: '写作',
        title: '小红书种草文案',
        preview: '你是一位小红书博主，擅长写种草文案。请为以下产品写一篇小红书笔记...',
        full: `你是一位小红书万粉博主，擅长写种草文案。

请为以下产品写一篇小红书笔记：
- 产品：{product}
- 价格：{price}
- 使用场景：{scenario}
- 核心卖点：{features}

要求：
1. 标题用emoji+痛点+解决方案的公式
2. 正文第一人称口吻，真实使用感受
3. 配emoji和分段，每段不超过3行
4. 埋3-5个相关话题标签
5. 结尾有明确的行动号召`
    },
    {
        id: 3,
        category: '营销',
        title: '产品详情页文案',
        preview: '你是一位电商转化专家。请为以下产品撰写高转化率的详情页文案...',
        full: `你是一位电商转化率优化专家，帮过100+品牌提升详情页转化率。

请为以下产品撰写详情页文案：
- 产品名称：{product}
- 目标用户：{audience}
- 核心卖点：{features}
- 价格区间：{price}
- 竞品差异：{differentiator}

结构要求：
1. 首屏：一句话痛点+产品解决
2. 卖点展开：每个卖点配场景图描述
3. 信任构建：数据/证书/用户评价
4. 对比表格：vs竞品的优势
5. 使用场景：3个典型场景
6. 购买理由：为什么现在买
7. 售后承诺：消除最后顾虑`
    },
    {
        id: 4,
        category: '营销',
        title: '朋友圈营销文案',
        preview: '你是一位朋友圈营销专家。请写5条不同风格的朋友圈营销文案...',
        full: `你是一位朋友圈营销专家，擅长软性营销不让人反感。

请为以下内容写5条朋友圈文案：
- 产品/服务：{product}
- 目标客户：{audience}
- 发圈目的：{goal}

风格轮流使用：
1. 故事型：讲一个客户故事
2. 干货型：分享一个行业技巧
3. 展示型：客户使用效果展示
4. 互动型：提问引发讨论
5. 紧迫型：限时优惠通知

每条配1-2个emoji和3-5个话题标签。`
    },
    {
        id: 5,
        category: '自媒体',
        title: '短视频爆款脚本',
        preview: '你是一个抖音百万粉博主。请根据主题写一个完整的短视频拍摄脚本...',
        full: `你是一个抖音百万粉丝博主，擅长制作爆款短视频。

请为以下主题写一个完整的拍摄脚本：
- 主题：{topic}
- 平台：{platform}
- 时长：{duration}
- 风格：{style}

脚本格式：
1. 【0-3秒】黄金开头：一句话/一个画面抓住注意力
2. 【3-15秒】铺垫：交代背景或提出问题
3. 【15-45秒】核心内容：干货/情节/反转
4. 【45-55秒】高潮或总结
5. 【结尾】引导点赞关注评论

包括：镜头景别、台词、BGM建议、字幕重点。`
    },
    {
        id: 6,
        category: '自媒体',
        title: 'YouTube视频大纲',
        preview: '你是一个YouTuber内容策划师。请为主题设计一个完整的视频大纲...',
        full: `你是一个资深YouTuber内容策划师。

请为主题"{topic}"设计一个完整的视频大纲：
1. 视频标题（3个候选，带点击率预估）
2. 缩略图概念描述
3. 开场Hook（15秒内必须抓住观众）
4. 内容分段（4-6段，每段时间分配）
5. 关键转折/高潮点
6. 结尾CTA（订阅/点赞/评论引导）
7. 描述栏文案（含时间戳）
8. 推荐标签（10-15个）`
    },
    {
        id: 7,
        category: '编程',
        title: '代码Debug助手',
        preview: '你是一位资深软件工程师。请帮我分析以下代码的问题并提供修复方案...',
        full: `你是一位拥有15年经验的资深软件工程师。

请分析以下代码：
\`\`\`
{code}
\`\`\`

请提供：
1. 问题诊断：逐行分析潜在问题
2. 根本原因：为什么会出现这个问题
3. 修复方案：提供修改后的完整代码
4. 预防建议：如何避免类似问题
5. 性能考量：是否有优化空间

语言/框架：{language}`
    },
    {
        id: 8,
        category: '编程',
        title: 'API接口设计',
        preview: '你是一位后端架构师。请帮我设计一套RESTful API接口...',
        full: `你是一位资深后端架构师，擅长API设计。

请为以下需求设计RESTful API：
- 业务场景：{scenario}
- 数据模型：{models}
- 用户角色：{roles}
- 技术栈：{stack}

输出：
1. API列表（端点、方法、描述）
2. 请求/响应格式（JSON Schema）
3. 认证方案
4. 分页和限流策略
5. 错误码定义
6. 变更日志建议`
    },
    {
        id: 9,
        category: '设计',
        title: 'UI设计建议',
        preview: '你是一位UI/UX设计专家。请为以下页面提供设计改进建议...',
        full: `你是一位UI/UX设计专家，曾为多家独角兽公司提供设计咨询。

请为以下产品/页面提供设计建议：
- 产品类型：{product}
- 目标用户：{audience}
- 当前问题：{problem}
- 设计风格偏好：{style}

提供：
1. 信息架构建议
2. 视觉层次优化
3. 色彩方案（含色值）
4. 字体搭配建议
5. 交互细节优化
6. 无障碍设计要点
7. 移动端适配建议`
    },
    {
        id: 10,
        category: '设计',
        title: 'Logo设计Brief',
        preview: '你是一位品牌设计师。请帮我撰写一份专业的Logo设计Brief...',
        full: `你是一位资深品牌设计师。

请根据以下信息撰写Logo设计Brief：
- 品牌名：{brand}
- 行业：{industry}
- 品牌个性：{personality}
- 目标受众：{audience}
- 竞品参考：{competitors}

Brief内容：
1. 品牌背景和愿景
2. 设计方向和风格（3个方向）
3. 色彩偏好和建议
4. 字体风格建议
5. 使用场景（线上/线下/印刷）
6. 避免的方向
7. 交付物清单`
    },
    {
        id: 11,
        category: '写作',
        title: '商业计划书大纲',
        preview: '你是一位创业顾问。请帮我撰写一份商业计划书的完整大纲...',
        full: `你是一位资深创业顾问，帮助过50+创业公司完成融资。

请为主题"{topic}"撰写商业计划书大纲：
1. 执行摘要
2. 公司概述
3. 市场分析（市场规模、趋势、细分）
4. 目标用户画像
5. 产品/服务描述
6. 商业模式
7. 竞争分析（对比表格）
8. 营销策略
9. 运营计划
10. 财务预测（3年）
11. 团队介绍
12. 融资需求`
    },
    {
        id: 12,
        category: '自媒体',
        title: '知乎高赞回答',
        preview: '你是一位知乎高赞答主。请为以下问题撰写一篇专业的高质量回答...',
        full: `你是一位知乎10万粉答主，擅长写高赞回答。

请回答问题：{question}

要求：
1. 开头：一句话定调，表明立场或抛出insight
2. 正文：用"总-分"结构，先给框架再展开
3. 每个观点配真实案例或数据
4. 适当使用加粗、列表增强可读性
5. 结尾：总结+引发讨论的开放问题
6. 文末附"如果觉得有用，请点赞让更多人看到"
7. 整体1500-3000字`
    },
];

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initApiKey();
    initPromptLibrary();
    initGenerateButtons();
    initCopyButtons();
});

// ===== Tab Switching =====
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
            document.getElementById(`panel-${targetTab}`).classList.add('active');
        });
    });
}

// ===== API Configuration Management =====
function initApiKey() {
    const providerSel = document.getElementById('aiProvider');
    const keyInput = document.getElementById('apiKey');
    const endpointInput = document.getElementById('apiEndpoint');
    const modelInput = document.getElementById('apiModel');
    const saveBtn = document.getElementById('saveApiKey');

    // Restore saved configuration
    providerSel.value = aiConfig.provider;
    if (aiConfig.apiKey) {
        keyInput.value = aiConfig.apiKey;
    }
    updateProviderUI();

    // Provider change
    providerSel.addEventListener('click', () => {
        setTimeout(() => {
            aiConfig.provider = providerSel.value;
            updateProviderUI();
        }, 10);
    });
    providerSel.addEventListener('change', () => {
        aiConfig.provider = providerSel.value;
        updateProviderUI();
    });

    // Save button
    saveBtn.addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (!key) {
            showApiStatus('error', '❌ 请输入 API Key');
            return;
        }
        aiConfig.provider = providerSel.value;
        aiConfig.apiKey = key;
        aiConfig.endpoint = endpointInput.value.trim();
        aiConfig.model = modelInput.value.trim();

        localStorage.setItem('ai_provider', aiConfig.provider);
        localStorage.setItem('ai_api_key', aiConfig.apiKey);
        localStorage.setItem('ai_endpoint', aiConfig.endpoint);
        localStorage.setItem('ai_model', aiConfig.model);

        const preset = getPreset();
        showApiStatus('success', '✅ 已保存！使用 ' + preset.name + ' · 模型: ' + getModel());
    });
}

function updateProviderUI() {
    const preset = getPreset();
    const keyInput = document.getElementById('apiKey');
    const endpointInput = document.getElementById('apiEndpoint');
    const modelInput = document.getElementById('apiModel');
    const isCustom = aiConfig.provider === 'custom';

    keyInput.placeholder = '输入 ' + preset.name + ' API Key（' + preset.keyHint + '）';

    endpointInput.style.display = isCustom ? 'block' : 'none';
    modelInput.style.display = isCustom ? 'block' : 'none';

    if (!isCustom) {
        endpointInput.value = preset.endpoint;
        modelInput.value = preset.model;
    }

    // Show/hide registration links
    const dsLink = document.querySelector('.ds-link');
    const qwenLink = document.querySelector('.qwen-link');
    if (dsLink) dsLink.style.display = (aiConfig.provider === 'deepseek') ? 'inline' : 'none';
    if (qwenLink) qwenLink.style.display = (aiConfig.provider === 'qwen') ? 'inline' : 'none';

    // Show saved status
    if (aiConfig.apiKey) {
        showApiStatus('success', '✅ 已配置 ' + preset.name + ' · 模型: ' + getModel());
    }
}

function showApiStatus(type, message) {
    const status = document.getElementById('apiStatus');
    status.className = 'api-status ' + type;
    status.textContent = message;
}

// ===== Generate Buttons =====
function initGenerateButtons() {
    document.getElementById('generate-copy').addEventListener('click', () => generateCopy());
    document.getElementById('generate-script').addEventListener('click', () => generateScript());
    document.getElementById('generate-resume').addEventListener('click', () => generateResume());
    document.getElementById('generate-xhs').addEventListener('click', () => generateXHSTitles());
}

// ===== Copy Buttons =====
function initCopyButtons() {
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const content = document.getElementById(targetId);
            const text = content.textContent || content.innerText;

            navigator.clipboard.writeText(text).then(() => {
                btn.classList.add('copied');
                btn.textContent = '✅ 已复制';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.textContent = '📋 复制';
                }, 2000);
            });
        });
    });
}

// ===== AI API Call (Multi-Provider) =====
async function callAI(systemPrompt, userMessage, maxTokens = 4000) {
    if (!aiConfig.apiKey) {
        showApiStatus('error', '❌ 请先选择 AI 服务并输入 API Key');
        return null;
    }

    const preset = getPreset();
    const endpoint = getEndpoint();
    const model = getModel();

    if (!endpoint) {
        return '❌ 请填写 API 地址';
    }

    try {
        let response;

        if (preset.format === 'anthropic') {
            // Claude uses Anthropic's native format
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': aiConfig.apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: maxTokens,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userMessage }]
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'API 错误 (' + response.status + ')');
            return data.content[0].text;
        } else {
            // All Chinese AIs use OpenAI-compatible format
            response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + aiConfig.apiKey
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: maxTokens,
                    temperature: 0.7,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ]
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || 'API 错误 (' + response.status + ')');
            return data.choices[0].message.content;
        }
    } catch (error) {
        console.error('AI API Error:', error);
        return '❌ 生成失败: ' + error.message + '\n\n请检查：\n1. API Key 是否正确\n2. 账户是否有余额\n3. API 地址和模型名是否匹配';
    }
}

// ===== Tool 1: Marketing Copy Generator =====
async function generateCopy() {
    if (isGenerating) return;

    const product = document.getElementById('cw-product').value.trim();
    const audience = document.getElementById('cw-audience').value.trim();
    const type = document.getElementById('cw-type').value;
    const features = document.getElementById('cw-features').value.trim();
    const tone = document.getElementById('cw-tone').value;

    if (!product) {
        alert('请至少填写产品/服务名称');
        return;
    }

    const output = document.getElementById('copywriter-output');
    const btn = document.getElementById('generate-copy');

    isGenerating = true;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> AI 正在生成...';
    output.innerHTML = '<div class="output-placeholder"><span class="placeholder-icon">⏳</span><p>Claude AI 正在为你创作...</p></div>';

    const systemPrompt = `你是一位资深营销文案专家，擅长撰写${type}文案。你的文案风格是${tone}的。请直接输出文案，不要解释你在做什么。`;

    const userMessage = `请为以下产品撰写${type}文案：

产品/服务：${product}
目标受众：${audience}
核心卖点：${features || '请根据产品类型自行发挥'}
风格：${tone}

要求：
- 如果是广告语，提供10条不同角度的候选
- 如果是朋友圈文案，写3条不同风格
- 如果是公众号文章，写完整的文章（含标题）
- 如果是详情页，按首屏、卖点、信任、对比、场景、购买理由的结构写
- 如果是小红书文案，用第一人称+emoji的风格
- 如果是销售信，用AIDA公式（注意-兴趣-欲望-行动）

开始吧！`;

    const result = await callAI(systemPrompt, userMessage, 4000);

    if (result) {
        output.innerHTML = `<div class="generated-content">${escapeHtml(result)}</div>`;
    }

    isGenerating = false;
    btn.disabled = false;
    btn.innerHTML = '🚀 AI 生成文案';
}

// ===== Tool 2: Short Video Script Generator =====
async function generateScript() {
    if (isGenerating) return;

    const topic = document.getElementById('vs-topic').value.trim();
    const platform = document.getElementById('vs-platform').value;
    const duration = document.getElementById('vs-duration').value;
    const audience = document.getElementById('vs-audience').value.trim();
    const style = document.getElementById('vs-style').value;

    if (!topic) {
        alert('请填写视频主题');
        return;
    }

    const output = document.getElementById('video-output');
    const btn = document.getElementById('generate-script');

    isGenerating = true;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> AI 正在生成...';
    output.innerHTML = '<div class="output-placeholder"><span class="placeholder-icon">⏳</span><p>Claude AI 正在为你编写脚本...</p></div>';

    const systemPrompt = `你是一位专业的短视频编导，擅长为${platform}平台创作${style}类内容。请直接输出完整脚本，不要解释。`;

    const userMessage = `请为以下需求创作一个${platform}短视频脚本：

视频主题：${topic}
目标受众：${audience}
视频时长：${duration}
视频风格：${style}

脚本格式要求：
1. 标题：吸引人的视频标题
2. 【镜头1】0-3秒 - 黄金开头（具体画面描述 + 台词）
3. 【镜头2】... - 内容展开
4. 【镜头N】结尾 - 引导互动
5. 每个镜头标注：时长、景别（特写/近景/中景/全景）、画面描述、台词
6. BGM建议
7. 文案字幕重点

请写出完整可拍摄的脚本！`;

    const result = await callAI(systemPrompt, userMessage, 4000);

    if (result) {
        output.innerHTML = `<div class="generated-content">${escapeHtml(result)}</div>`;
    }

    isGenerating = false;
    btn.disabled = false;
    btn.innerHTML = '🎬 AI 生成脚本';
}

// ===== Tool 3: Resume Optimizer =====
async function generateResume() {
    if (isGenerating) return;

    const job = document.getElementById('res-job').value.trim();
    const industry = document.getElementById('res-industry').value.trim();
    const experience = document.getElementById('res-experience').value;
    const content = document.getElementById('res-content').value.trim();
    const focus = document.getElementById('res-focus').value;

    if (!content) {
        alert('请粘贴你的简历内容');
        return;
    }

    const output = document.getElementById('resume-output');
    const btn = document.getElementById('generate-resume');

    isGenerating = true;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> AI 正在优化...';
    output.innerHTML = '<div class="output-placeholder"><span class="placeholder-icon">⏳</span><p>Claude AI 正在优化你的简历...</p></div>';

    const systemPrompt = `你是一位资深HR和职业规划师，曾在${industry}行业招聘过大量人才。你的任务是根据目标岗位优化简历。优化重点是${focus}。请直接输出优化后的简历，不要解释。`;

    const userMessage = `请优化以下简历：

目标岗位：${job}
目标行业：${industry}
工作年限：${experience}
优化重点：${focus}

原始简历内容：
---
${content}
---

优化要求：
1. 突出与目标岗位最相关的经验
2. 用STAR法则重写工作经历（情境-任务-行动-结果）
3. 量化成果（用数字说话）
4. 加入行业关键词（通过ATS筛选）
5. 精简不相关内容
6. 修正语法和用词
7. 保持专业、简洁的格式

请直接输出优化后的完整简历：`;

    const result = await callAI(systemPrompt, userMessage, 4000);

    if (result) {
        output.innerHTML = `<div class="generated-content">${escapeHtml(result)}</div>`;
    }

    isGenerating = false;
    btn.disabled = false;
    btn.innerHTML = '📄 AI 优化简历';
}

// ===== Tool 4: XHS Title Generator =====
async function generateXHSTitles() {
    if (isGenerating) return;

    const topic = document.getElementById('xhs-topic').value.trim();
    const type = document.getElementById('xhs-type').value;
    const keywords = document.getElementById('xhs-keywords').value.trim();
    const count = parseInt(document.getElementById('xhs-count').value);
    const emoji = document.getElementById('xhs-emoji').value;

    if (!topic) {
        alert('请填写笔记主题');
        return;
    }

    const output = document.getElementById('xhs-output');
    const btn = document.getElementById('generate-xhs');

    isGenerating = true;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> AI 正在生成...';
    output.innerHTML = '<div class="output-placeholder"><span class="placeholder-icon">⏳</span><p>Claude AI 正在为你创作爆款标题...</p></div>';

    const systemPrompt = `你是一位小红书运营专家，深谙爆款标题的创作公式。你的标题具有高点击率和高互动率。请直接输出标题列表，每条一行，用序号标记。`;

    const userMessage = `请为以下小红书笔记生成${count}条爆款标题：

笔记主题：${topic}
内容类型：${type}
目标关键词：${keywords || '根据主题自动匹配'}
Emoji使用：${emoji}

创作要求：
1. 运用爆款公式轮换：数字+痛点、悬念+好奇、对比+反差、身份认同、利益承诺
2. 每条标题带1-3个emoji
3. 尽量包含热搜关键词
4. 标题长度控制在15-25字
5. 每条标题后面标注【预估点击率：高/中/极高】和适用的爆款公式

直接输出标题列表：`;

    const result = await callAI(systemPrompt, userMessage, 3000);

    if (result) {
        output.innerHTML = `<div class="generated-content">${escapeHtml(result)}</div>`;
    }

    isGenerating = false;
    btn.disabled = false;
    btn.innerHTML = '🔥 AI 生成标题';
}

// ===== Prompt Library =====
function initPromptLibrary() {
    renderPrompts('all');

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPrompts(btn.dataset.filter);
        });
    });
}

function renderPrompts(filter) {
    const grid = document.getElementById('prompts-grid');
    const filtered = filter === 'all' ? promptLibrary : promptLibrary.filter(p => p.category === filter);

    grid.innerHTML = filtered.map(prompt => `
        <div class="prompt-card">
            <span class="prompt-category">${prompt.category}</span>
            <div class="prompt-title">${prompt.title}</div>
            <div class="prompt-preview">${escapeHtml(prompt.preview)}</div>
            <div class="prompt-actions">
                <button class="btn-use-prompt" onclick="usePrompt(${prompt.id})">📋 复制提示词</button>
            </div>
        </div>
    `).join('');
}

function usePrompt(id) {
    const prompt = promptLibrary.find(p => p.id === id);
    if (!prompt) return;

    navigator.clipboard.writeText(prompt.full).then(() => {
        showToast(`✅ 已复制「${prompt.title}」提示词到剪贴板`);
    });
}

// ===== Utility Functions =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>')
        .replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>')
        .replace(/# (.*?)(<br>|$)/g, '<h1>$1</h1>')
        .replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>');
}

function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2500);
}
