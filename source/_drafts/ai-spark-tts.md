---
abbrlink: AI语音克隆
categories:
- - AI
date: '2025-11-11T11:49:12.232872+08:00'
tags:
- AI
- 本地部署
- 克隆语音
title: 本地化部署AI语音克隆模型
updated: '2025-11-11T11:49:12.415+08:00'
---
Spark-TTS 是一种先进的文本转语音系统，它利用大型语言模型 （LLM） 的强大功能进行高度准确和自然的语音合成。它的设计高效、灵活、强大，适用于研究和生产用途。


# github

[SparkAudio/Spark-TTS: Spark-TTS Inference Code](https://github.com/sparkaudio/spark-tts)

# 安装

```powershell
git clone https://github.com/SparkAudio/Spark-TTS.git
cd Spark-TTS
```

## 创建虚拟环境并安装依赖

```powershell
conda create -n sparktts -y python=3.12
conda activate sparktts
pip install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/ --trusted-host=mirrors.aliyun.com
```

## 下载模型


大约4G左右，需要持续一段时间。

```powershell
mkdir -p pretrained_models
git lfs install
git clone https://huggingface.co/SparkAudio/Spark-TTS-0.5B pretrained_models/Spark-TTS-0.5B
```

# 使用


启动命令`python webui.py --device 0` 表示启动webui，并使用第一个GPU设备。


如果出现下面的报错信息，那么就是gradio版本太高了，降低版本`pip install "gradio<4"`就能解决。

```powershell
D:\anaconda3\envs\sparktts\Lib\site-packages\torch\nn\utils\weight_norm.py:143: FutureWarning: `torch.nn.utils.weight_norm` is deprecated in favor of `torch.nn.utils.parametrizations.weight_norm`.
  WeightNorm.apply(module, name, dim)
Missing tensor: mel_transformer.spectrogram.window
Missing tensor: mel_transformer.mel_scale.fb
信息: 用提供的模式无法找到文件。
* Running on local URL:  http://0.0.0.0:7860
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "D:\anaconda3\envs\sparktts\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 403, in run_asgi
.......
  File "D:\anaconda3\envs\sparktts\Lib\site-packages\gradio_client\utils.py", line 898, in get_type
    if "const" in schema:
       ^^^^^^^^^^^^^^^^^
TypeError: argument of type 'bool' is not iterable
```
