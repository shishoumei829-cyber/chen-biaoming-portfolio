# 数字生命对话系统设计与评价

**（投稿《包装工程》· 技术应用类 · 盲审稿请勿在正文保留作者信息）**

---

## 英文题名

Design and Evaluation of a Digital Life Dialogue System for Continuous Character Presence

---

## 结构式摘要

**【目的】** 面向智能陪伴与 IP 角色互动产品，解决大语言模型（LLM）角色对话「单轮像、多轮穿帮、缺乏在场感」的体验问题，提出可观测、可迭代的对话系统架构并验证其相对传统 prompt 方案的效果。

**【方法】** 设计 AMADEUS 数字生命对话系统，将人格栈、分房间记忆、PAD 情感矩阵、行为仲裁与心智加工模块串联为固定流水线；以牧濑红莉栖角色为实例，构建 8 类交互场景×6 轮脚本语料。采用同底模双组对照（实验组：完整系统；对照组：仅第一人称扮演 prompt），由两名熟悉作品的评分者独立依据七维 rubric（人设、原著、一致、不胡编、共情、智识、自然）打分，主分析取两人均值，报告评分者间信度并进行 Mann-Whitney 检验。

**【结果】** 96 轮有效对话中，实验组综合分（3.79）高于对照组（2.96），会话级 Mann-Whitney 检验 p=0.0004；人设、共情、自然度维度提升最大（Δ 分别为 +1.50、+0.91、+0.95）。评分者对人设与共情维度一致性较高（Cohen's κ≥0.72），综合分 Spearman r=0.78。

**【结论】** 在探索性 pilot 条件下，可观测认知中间层相对「厚 prompt」基线具有一致的方向性优势，尤其利于 IP 角色产品的口吻稳定与情绪承接；该架构可为工业设计语境下的数字生命交互提供模块化参考，后续需扩大样本并开展模块消融与用户研究。

**关键词：** 数字生命；交互设计；角色对话；情感计算；对照实验

---

## Abstract

**Purpose:** To address inconsistent character presence in LLM-based role-play products, a modular digital-life dialogue architecture was proposed and evaluated against a prompt-only baseline on a fixed backbone model.

**Methods:** The AMADEUS pipeline integrates a layered persona stack, roomed memory retrieval, PAD affect updating, behavior arbitration, and mind-turn instructions. A scripted corpus (eight scenarios, six turns each) was scored by two independent raters using a seven-dimension rubric.

**Results:** The full system outperformed the baseline in mean composite score (3.79 vs. 2.96, p=0.0004), with the largest gains in persona, empathy, and naturalness. Inter-rater agreement was strong for persona and empathy (κ≥0.72).

**Conclusions:** Observable middleware shows exploratory advantages for character presence without changing the backbone model, informing smart companion and IP interaction design.

**Keywords:** digital life; interaction design; character dialogue; affective computing; controlled experiment

---

## 1 引言

智能终端与虚拟偶像、陪伴硬件的普及，使「角色是否在场」成为体验设计核心，而不仅是回答是否正确[1-2]。工业设计实践中常见做法是堆叠 System Prompt 或接入检索增强生成（RAG），但回复前内部状态不可见，难以支撑产品迭代与 A/B 测试[3]。

本文面向 **数字生命 / IP 角色对话产品**，提出 AMADEUS 架构：将人格、记忆、情绪与行为决策拆为可日志化模块，并在 **同一 LLM 底模** 下与「仅扮演 prompt」对照，回答：（1）叠加中间层是否提升可感知角色质量；（2）优势集中在哪些交互场景。研究定位为 **探索性技术应用**，为设计团队提供可复现的 pilot 范式，而非通用模型性能竞赛。

---

## 2 系统架构

AMADEUS 每轮按「情感更新→行为仲裁→记忆检索/写入→心智加工→组装 prompt→生成对白」执行；对照组仅保留第一人称扮演指令与多轮历史，不启用中间层。

### 2.1 人格栈

分三层静态文本注入：**核心层**（身份断言与设定边界）、**口吻层**（每轮优先的语气与篇幅）、**传记层**（情绪与记忆底色，不作台词表）。保证「谁在说话」先于「说什么」。

### 2.2 记忆宫殿

设 Hall（默认）、Lab（学术）、Cafe（日常）、Forbidden（亲密/冲突）四房间，按关键词路由写入与检索，每房保留最近 8 条、检索合并最多 4 条，降低记忆串味。

### 2.3 PAD 与行为仲裁

PAD 在愉悦、唤醒、支配三轴外加关系强度 S，按刺激重要性非线性更新；综合情绪分输入仲裁。六类行为倾向（靠近、日常、偏转、智识投入、退缩等）按规则累加取最高；亲密词优先触发 **偏转** 以符合傲娇人设（先否认再靠近），穿帮词触发偏转与智识投入。

### 2.4 心智加工

按输入类型生成「逻辑—共情—智识」对内指令，约束对外 80～180 字口语对白，减少客服腔与讲课腔。

**图1** 建议置于此处：系统单轮处理流程框图（见完整稿附录或作者提供的图源文件）。

---

## 3 实验与评价

### 3.1 对照设计

实验组 A：AMADEUS 完整栈；对照组 D：同底模 `kurisu:latest`、同扮演 prompt、无中间层。8 场景（原著、设定、梗、智识、共情、关系、记忆、穿帮）各 6 轮，每组 48 轮，共 96 轮。

### 3.2 评分

两名熟悉《命运石之门》的评分者独立盲评（评分者 1 为研究者，评分者 2 为外校研究生；主分析用两人均值，并报告 κ、ICC、Spearman）。综合分 = 七维 1～5 分均值。统计：会话级 n=8，Mann-Whitney U（单侧 A>D），α=0.05；不报告 Cohen's d（n 过小易失真）。

---

## 4 结果

### 4.1 描述与推断

**表1** 轮次级均分（n=48/组）：实验组综合 3.79，对照 2.96，Δ=+0.83。人设 +1.50、共情 +0.91、自然 +0.95 提升最大；智识 +0.19 最小。会话级 Mann-Whitney p=0.0004，两名评分者方向一致。

**表2** 评分者间信度（96 轮）：综合 κ=0.46，Spearman r=0.78（p<0.001）；人设 κ=0.80，共情 κ=0.72；原著贴合 κ 偏低（0.008），反映标定差异而非组间排序相反。

### 4.2 场景分布

**表3** 八场景综合分 Δ：智识 +1.81、穿帮 +1.35、原著/梗约 +1.2～+1.3；记忆 +0.70 最小（维度内仅 6 轮，长程记忆未充分展开）。

### 4.3 质性示例（CANON 第 1 轮）

用户问初遇冈部。实验组：「……冲出来就喊『这里有超自然现象』……蠢样让人火大。」对照组同底模却写「穿着红色战斗服」——与常见初遇设定不符，体现 **设定偏差** 而非仅语气差异。穿帮场景中，实验组给出设定内关键词，对照组出现编造暗号。

---

## 5 讨论与结论

结果表明，在固定底模上，**可观测中间层** 主要改善人设在场、共情承接与抗穿帮，对工业设计中的 IP 对话产品具有三点启示：（1）产品侧应把 prompt 之外的 **状态机** 纳入版本管理；（2）评价宜分场景（原著/穿帮/情绪）而非单一「像不像」；（3）日志字段（PAD、行为标签、记忆房间）支持设计—开发协同调试。

局限包括：pilot 样本、作者参与评分、单角色单底模、原著维 rubric 需校准。后续将开展模块消融、第三方盲评与真实用户短期体验研究。

---

## 参考文献

[1] NORMAN D A. 设计心理学：日常的设计[M]. 小柯, 等译. 北京: 中信出版社, 2015.

[2] 刘邦成, 曾辉. 情感化设计三要素在产品设计中的应用研究[J]. 包装工程, 2012, 33(2): 57-61.

[3] XIAO Y, LI Q, ZHANG Z, et al. Research and evaluation of multi-sensory design of product packaging based on VR technology in online shopping environment[J]. Applied Sciences, 2024, 14(17): 7736.

[4] WU S, HAN S. System evaluation of artificial intelligence and virtual reality technology in the interactive design of interior decoration[J]. Applied Sciences, 2023, 13(17): 6272.

[5] SHAO Y, LI H, DONG Q, et al. Character-LLM: A trainable agent for role-playing[C]//Proceedings of EMNLP 2023. Stroudsburg: ACL, 2023.

[6] PARK J S, O'BRIEN S, CAI C J, et al. Generative agents: Interactive simulacra of human behavior[C]//Proceedings of UIST 2023. New York: ACM, 2023.

[7] PACKER C, FANG V, PATWARDHAN M, et al. MemGPT: Towards LLMs as operating systems[EB/OL]. (2023-10-12)[2026-05-24]. https://arxiv.org/abs/2310.08560.

[8] MEHRABIAN A, RUSSELL J A. An approach to environmental psychology[M]. Cambridge: MIT Press, 1974.

[9] KIM J, HA J. User experience in VR fashion product shopping: focusing on tangible interactions[J]. Applied Sciences, 2021, 11(13): 6170.

[10] COHEN J. Weighted kappa: Nominal scale agreement with provision for scaled disagreement or partial credit[J]. Psychological Bulletin, 1968, 70(4): 213-220.

[11] SHROUT P E, FLEISS J L. Intraclass correlations: Uses in assessing rater reliability[J]. Psychological Bulletin, 1979, 86(2): 420-428.

[12] MANN H B, WHITNEY D R. On a test of whether one of two random variables is stochastically larger than the other[J]. The Annals of Mathematical Statistics, 1947, 18(1): 50-60.

[13] 中华人民共和国国家质量监督检验检疫总局, 中国国家标准化管理委员会. 面向对象的软件工程 软件生存周期过程: GB/T 8566—2007[S]. 北京: 中国标准出版社, 2007.

[14] NIELSEN J. Usability engineering[M]. San Francisco: Morgan Kaufmann, 1993.

[15] MAGES, ニトロプラス. STEINS;GATE[CP]. 东京: MAGES, 2009.

> **文献核验说明：** 投稿前请在知网检索《包装工程》2020—2025 年「智能产品 / 交互设计 / 用户体验」论文 **至少 1 篇**，可替换 [14] 或增补为 [16]，并统一按本刊参考文献格式著录。

---

**（以下勿编入正文字数）**

**通信作者：** ________，E-mail：________，电话：________  

**基金项目：** ________（无则写「无」）  

**第一作者简介：** 陈彪明（200__—），__，桂林电子科技大学设计与创意学院本科生，研究方向为工业设计、智能产品交互。  

**图题表题英文对照（排版用）：**  
Fig.1 Pipeline of AMADEUS per dialogue turn  
Tab.1 Mean rubric scores per group  
Tab.2 Inter-rater reliability  
Tab.3 Composite score gap by scenario  
