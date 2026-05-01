---
abbrlink: ''
categories:
- - 知识储备
date: '2026-05-01T09:38:04.932+08:00'
tags:
- openclaw
- AI
title: OpenClaw的踩坑过程
updated: '2026-05-01T09:38:04.932+08:00'
---

## 安装

参考官方文档[安装](https://docs.openclaw.ai/zh-CN/install)

宿主机是Debian 13,PVE作为软路由的，直接使用官方命令安装
```shell
curl -fsSL https://openclaw.ai/install.sh | bash
```

**!!! 但是！Openclaw更新必崩！，截至2026-05-01,我使用的最终稳定版是`2026.4.23`**

## 配置

只要集中在openclaw.json文件的配置。

使用了nvidia的免费模型，注册的时候，选不到86，所以不要管，直接输入+861**********就可以收到验证码了。
**！！！但是！模型会过期！nvidia的页面上是可用的，但是实际上模型临期后就无法正常用了，所以要注意时间随时更换，当然了，如果是收费模型没这个问题**

目前按照onboard设置后几乎没有问题了，但是还是有个别官方文档

openclaw.json
```json
{
  // 这个节点配合tools中的节点，可以免权限验证
  "approvals": {
    "exec": {
      "enabled": true
    }
  },
  //智能体
  "agents": {
    "defaults": {
      "workspace": "/root/.openclaw/workspace",
      // 默认可用的模型
      "models": {
        "nv/stepfun-ai/step-3.5-flash": {},
        "nv/google/gemma-4-31b-it": {},
        "nv/deepseek-ai/deepseek-v4-flash": {},
        "nv/qwen/qwen3.5-397b-a17b": {},
        "nv/minimaxai/minimax-m2.7": {},
        "nv/z-ai/glm-5.1": {},
        "openrouter/google/gemma-4-31b-it:free": {}
      },
      "model": {
        // 默认智能体默认模型
        "primary": "nv/z-ai/glm-5.1",
        // 如果智能体默认模型不可用会按照下面的顺序回退尝试
        "fallbacks": [
          "nv/google/gemma-4-31b-it",
          "nv/minimaxai/minimax-m2.7",
          "nv/qwen/qwen3.5-397b-a17b",
          "nv/z-ai/glm-5.1",
          "nv/deepseek-ai/deepseek-v4-flash",
          "nv/stepfun-ai/step-3.5-flash",
          "openrouter/google/gemma-4-31b-it:free"
        ]
      },
      "compaction": {
        "mode": "safeguard",
        "reserveTokensFloor": 20000,
        "memoryFlush": {
          "enabled": true
        }
      },
      // 记忆搜索，这个在nvidia模型中搜embed，但是只有这个是可用的，使用openclaw memory status --deep验证
      "memorySearch": {
        // 这里是不是实际供应商，是协议格式，即使使用的nvidia，也配置openai
        "provider": "openai",
        "model": "nvidia/nv-embed-v1",
        "remote": {
          "baseUrl": "https://integrate.api.nvidia.com/v1/",
          "apiKey": "nvapi-*************"
        }
      },
      "subagents": {
        "allowAgents": [
          "*"
        ]
      },
      // 默认思考模式：高
      "thinkingDefault": "high",
      "humanDelay": {
        "mode": "natural"
      },
      "timeoutSeconds": 3600,
      "typingMode": "never"
    },
    "list": [
      {
        "id": "main"
      },
      {
        "id": "work",
        "name": "work",
        "workspace": "/root/.openclaw/workspace-work",
        "agentDir": "/root/.openclaw/agents/work/agent",
        // 智能体指定模型
        "model": "nv/deepseek-ai/deepseek-v4-flash",
        "reasoningDefault": "stream",
        // 心跳
        "heartbeat": {
          "every": "10m",
          "includeReasoning": false,
          "directPolicy": "allow",
          "target": "telegram",
          // 使用telegram聊天的会话，心跳内容会出现在会话中
          "session": "agent:work:telegram:work:direct:telegram账号",
          "to": "telegram账号",
          "accountId": "work",
          // 心跳执行时间
          "activeHours": {
            "start": "06:30",
            "end": "23:30",
            "timezone": "Asia/Shanghai"
          },
          "ackMaxChars": 1024,
          "suppressToolErrorWarnings": false,
          "lightContext": false,
          "isolatedSession": false,
          "timeoutSeconds": 3600
        }
      },
      {
        "id": "home",
        "name": "home",
        "model": "nv/z-ai/glm-5.1",
        "workspace": "/root/.openclaw/workspace-home",
        "agentDir": "/root/.openclaw/agents/home/agent",
        "reasoningDefault": "stream",
        "heartbeat": {
          "every": "30m",
          "includeReasoning": false,
          "directPolicy": "allow",
          "target": "telegram",
          "to": "telegram账号",
          "session": "agent:home:telegram:home:direct:telegram账号",
          "accountId": "home",
          "activeHours": {
            "start": "06:30",
            "end": "23:30",
            "timezone": "Asia/Shanghai"
          },
          "ackMaxChars": 1024,
          "suppressToolErrorWarnings": false,
          "lightContext": false,
          "isolatedSession": false
        }
      }
    ]
  },
  "bindings": [
    {
      "type": "route",
      "agentId": "work",
      "match": {
        "channel": "telegram",
        "accountId": "work"
      }
    },
    {
      "type": "route",
      "agentId": "home",
      "match": {
        "channel": "telegram",
        "accountId": "home"
      }
    }
  ],
  "channels": {
    "defaults": {
      "contextVisibility": "all"
    },
    "telegram": {
      "enabled": true,
      "capabilities": {
        "inlineButtons": "allowlist"
      },
      "groupPolicy": "open",
      "groups": {
        "-100群组号": {
          "requireMention": false
        }
      },
      "actions": {
        "reactions": true,
        "sendMessage": true,
        "sticker": true
      },
      "dmPolicy": "allowlist",
      "allowFrom": [
        "telegram账号"
      ],
      "reactionNotifications": "all",
      "reactionLevel": "extensive",
      "mediaMaxMb": 256,
      // telegram会报网络错误的情况下加的配置
      "network": {
        "autoSelectFamily": true,
        "dnsResultOrder": "ipv4first"
      },
      // 代理地址，根据实际情况使用
      "proxy": "http://127.0.0.1:7890",
      "accounts": {
        "work": {
          "enabled": true,
          "botToken": "机器人token"
        },
        "home": {
          "enabled": true,
          "botToken": "机器人token"
        }
        "default": {
          "dmPolicy": "allowlist",
          "allowFrom": [
            "telegram账号"
          ]
        }
      }
    }
  },
  "gateway": {
    "mode": "local",
    "auth": {
      "mode": "token",
      "token": "token"
    },
    "port": 18789,
    "bind": "loopback",
    "tailscale": {
      "mode": "off",
      "resetOnExit": false
    },
    "controlUi": {
      "allowInsecureAuth": false
    },
    "nodes": {
      "denyCommands": [
        "camera.snap",
        "camera.clip",
        "screen.record",
        "contacts.add",
        "calendar.add",
        "reminders.add",
        "sms.send",
        "sms.search"
      ]
    }
  },
  "models": {
    "mode": "merge",
    "providers": {
      // 虽然openclaw后面直接支持了NVIDIA的提供商，但是nvidia的模型变动大并且，默认的NVIDIA模型有时候会无法连接，还是使用自定义
      // 为了方式和openclaw直接的nvidia冲突，所以换个名字
      "nv": {
        "baseUrl": "https://integrate.api.nvidia.com/v1",
        "api": "openai-completions",
        "apiKey": "nvapi-******",
        "models": [
          {
            "id": "stepfun-ai/step-3.5-flash",
            "name": "stepfun-ai/step-3.5-flash",
            "reasoning": false,
            "input": [
              "text"
            ],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 1000000,
            "maxTokens": 256000,
            "api": "openai-completions"
          },
          {
            "id": "google/gemma-4-31b-it",
            "name": "google/gemma-4-31b-it",
            "reasoning": false,
            "input": [
              "text",
              "image" // 这里是不能写video的
            ],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 1000000,
            "maxTokens": 256000,
            "api": "openai-completions"
          },
          {
            "id": "minimaxai/minimax-m2.7",
            "name": "minimaxai/minimax-m2.7",
            "reasoning": false,
            "input": [
              "text"
            ],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 1000000,
            "maxTokens": 256000,
            "api": "openai-completions"
          },
          {
            "id": "deepseek-ai/deepseek-v4-flash",
            "name": "deepseek-ai/deepseek-v4-flash",
            "reasoning": false,
            "input": [
              "text"
            ],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 1000000,
            "maxTokens": 256000,
            "api": "openai-completions"
          },
          {
            "id": "z-ai/glm-5.1",
            "name": "z-ai/glm-5.1",
            "reasoning": false,
            "input": [
              "text"
            ],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 1000000,
            "maxTokens": 128000,
            "api": "openai-completions"
          },
          {
            "id": "qwen/qwen3.5-397b-a17b",
            "name": "qwen/qwen3.5-397b-a17b",
            "reasoning": false,
            "input": [
              "text",
              "image"
            ],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 1000000,
            "maxTokens": 256000,
            "api": "openai-completions"
          },
          {
            "id": "nvidia/nemotron-nano-12b-v2-vl",
            "name": "nvidia/nemotron-nano-12b-v2-vl",
            "reasoning": false,
            "input": [
              "image"
            ],
            "cost": {
              "input": 0,
              "output": 0,
              "cacheRead": 0,
              "cacheWrite": 0
            },
            "contextWindow": 128000,
            "maxTokens": 8192,
            "api": "openai-completions"
          }
        ]
      }
    }
  },
  "plugins": {
    "entries": {
      "openrouter": {
        "enabled": true
      },
      // 开启dreaming支持，使用openclaw plugins enable memory-core开启
      "memory-core": {
        // 开启后增加config节点内容
        "config": {
          "dreaming": {
            "enabled": true,
            "frequency": "0 */1 * * *" //没小时一次
          }
        },
        "enabled": true
      },
      "memory-lancedb": {
        "enabled": true //改为true
      }
    },
    "slots": {
      "memory": "memory-core"
    }
  },
  "session": {
    "dmScope": "per-account-channel-peer"
  },
  "tools": {
    // 完全放开权限
    "profile": "full",
    "sessions": {
      "visibility": "all"
    },
    // 这里设置的是work和home两个智能体可以互相聊天，但是只能使用subagent的形式，不能有来有回的，只能一次，也许后面更新会支持
    "agentToAgent": {
      "enabled": true,
      "allow": [
        "work",
        "home"
      ]
    },
    "web": {
      "fetch": {
        "enabled": true,
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0"
      }
    },
    "media": {
      "image": {
        "enabled": true,
        "maxChars": 4096,
        "maxBytes": 104857600,
        "models": [
          {
            "type": "provider",
            // 这里是神奇的，提供商要写nvidia，否则会失败，应该是读取了环境变量中的NVIDIA_API_KEY，配置后可以分析图片和视频了
            "provider": "nvndia",
            "model": "nvidia/nemotron-nano-12b-v2-vl",
            // 但是好像没有覆盖默认的提示词，不知为何这个配置不生效
            "prompt": "描述内容，包括场景、人物、物体、行为、颜色、氛围等所有细节，并的预估出每个元素的尺寸。",
            "capabilities": [
              "image",
              "video"
            ]
          },
          {
            "type": "provider",
            "provider": "nv",
            "model": "google/gemma-4-31b-it",
            "prompt": "描述内容，包括场景、人物、物体、行为、颜色、氛围等所有细节，并的预估出每个元素的尺寸。",
            "capabilities": [
              "image",
              "video"
            ]
          }
        ]
      }
    },
    // 配合approvals 实现免授权
    "elevated": {
      "enabled": true,
      "allowFrom": {
        "telegram": [
          telegram账号，不需要引号
        ]
      }
    },
    // 配合approvals 实现免授权
    "exec": {
      "security": "full",
      "ask": "off",
      "backgroundMs": 10000,
      "timeoutSec": 1800,
      "cleanupMs": 1800000,
      "notifyOnExit": true
    }
  },
  "auth": {
    "profiles": {
      "openrouter:default": {
        "provider": "openrouter",
        "mode": "api_key"
      }
    }
  },
  "skills": {
    "install": {
      "nodeManager": "npm"
    }
  },
  "hooks": {
    "internal": {
      "enabled": true,
      "entries": {
        "boot-md": {
          "enabled": true
        },
        "bootstrap-extra-files": {
          "enabled": true
        },
        "command-logger": {
          "enabled": true
        },
        "session-memory": {
          "enabled": true
        }
      }
    }
  },
  "wizard": {
    "lastRunAt": "2026-04-30T15:12:01.484Z",
    "lastRunVersion": "2026.4.23",
    "lastRunCommand": "doctor",
    "lastRunMode": "local"
  },
  "meta": {
    "lastTouchedVersion": "2026.4.23",
    "lastTouchedAt": "2026-04-30T15:34:10.659Z"
  }
}

```
