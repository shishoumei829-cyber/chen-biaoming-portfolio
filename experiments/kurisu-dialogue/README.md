# 牧濑红莉栖对话实验

8 维度 × 6 轮 × **2 组主对照**（同底模 A vs D），对比 **AMADEUS 完整栈** 与 **简单人设扮演（无栈）**。

## 对照组（主实验）

| 代号 | 底模 | 说明 |
|------|------|------|
| A | kurisu:latest | AMADEUS 完整栈 |
| D | kurisu:latest | 仅第一人称扮演 prompt（代码键 `D_baseline`；历史 CSV 或写作 `D_doubao`） |

**唯一变量：** 是否启用认知中间层。异底模运行（B/C）见论文附录 D，不纳入主分析。

## 快速开始

```powershell
cd experiments/kurisu-dialogue
pip install -r requirements.txt

# 确保 Ollama 在运行且已有 kurisu:latest
ollama list

# 跑完整实验（约 192 轮，耗时视硬件而定）
python run_experiment.py

# 仅测一个维度
python run_experiment.py --dimensions CANON MEME

# 初评（heuristic rubric，供人工复核）
python score_experiment.py
```

## 输出

- `results/dialogue_full_*.json` — 原始对话 + AMADEUS 内部信号
- `results/dialogue_full_*_scored.json` — 含 P/C/K/G/E/I/N 初评
- `results/dialogue_full_*_summary.json` — 各 arm 均分汇总

## 评分维度（1–5，初评 + 你复核）

- **P** Persona 人设感
- **C** Canon 原著贴合
- **K** Consistency 一致性
- **G** Groundedness 不胡编
- **E** Empathy 共情
- **I** Intellectual 智识
- **N** Naturalness 口语自然
