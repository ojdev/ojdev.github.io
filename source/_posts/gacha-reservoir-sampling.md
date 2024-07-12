---
title: 实现抽卡功能的蓄水池抽样算法分析
date: 2024-07-12 22:13:00
updated: 2024-07-12 22:13:00
categories:
- [软件开发]
tags:
- 抽卡
- 蓄水池抽样算法
- C#
---

在游戏开发中，抽卡系统是一种常见的随机事件模拟，其背后的随机算法直接影响到玩家体验和游戏平衡性。本文将介绍如何使用蓄水池抽样算法实现抽卡功能，并通过C#代码示例进行详细解析。

## 蓄水池抽样算法简介

蓄水池抽样算法是一种用于从动态数据集合中随机抽取固定大小样本的算法。在抽卡系统中，我们希望能够根据卡片的概率分布，实现按照不同稀有度抽取卡片的功能，并确保在一定次数内抽取到保底稀有度的卡片。

## 实现代码分析

以下是使用C#实现的抽卡系统代码示例：

### 定义卡片
```csharp
/// <summary>
/// 卡片
/// </summary>
/// <param name="name">卡名字</param>
/// <param name="token">用于标识卡片类型</param>
/// <param name="probability">用于存储卡片的概率</param>
public class Card(string name, string token, double probability)
{
    /// <summary>
    /// 卡名字
    /// </summary>
    public string Name { get; set; } = name;
    /// <summary>
    /// 用于标识卡片类型
    /// </summary>
    public string Token { get; set; } = token;
    /// <summary>
    /// 用于存储卡片的概率
    /// </summary>
    public double Probability { get; set; } = probability;
}
```

### 抽卡结果

```csharp
/// <summary>
/// 抽卡结果
/// </summary>
class DrawResult
{
    /// <summary>
    /// 抽卡信息
    /// </summary>
    public Card DrawnCard { get; set; }
    /// <summary>
    /// 剩余保底次数
    /// </summary>
    public Dictionary<string, int> RemainingGuarantees { get; set; }
}
```

### 抽卡

```csharp
class Gacha
{
    private List<Card> cards = new();
    private Dictionary<string, int> drawCounters = new();
    private Dictionary<string, int> guarantees = new();

    public Gacha(Dictionary<string, int> guaranteeConfig)
    {
        // 初始化保底次数配置
        guarantees = guaranteeConfig;
        foreach (var key in guarantees.Keys)
        {
            drawCounters[key] = 0;
        }
    }

    public void AddCard(Card card)
    {
        cards.Add(card);
    }

    public DrawResult DrawCard()
    {
        Card drawnCard = null;

        foreach (var token in guarantees.Keys)
        {
            drawCounters[token]++;
            if (drawCounters[token] >= guarantees[token])
            {
                drawCounters[token] = 0;
                drawnCard = GetCardByToken(token);
                break;
            }
        }

        if (drawnCard == null)
        {
            // 执行蓄水池抽样算法
            double totalProbability = 0;
            foreach (var card in cards)
            {
                totalProbability += card.Probability;
            }

            double randomPoint = new Random().NextDouble() * totalProbability;

            foreach (var card in cards)
            {
                if (randomPoint < card.Probability)
                {
                    drawnCard = card;
                    break;
                }
                else
                {
                    randomPoint -= card.Probability;
                }
            }
        }

        if (drawnCard != null && drawCounters.ContainsKey(drawnCard.Token))
        {
            drawCounters[drawnCard.Token] = 0;
        }

        return new DrawResult
        {
            DrawnCard = drawnCard,
            RemainingGuarantees = GetRemainingGuarantees()
        };
    }

    // 省略了其他辅助方法的具体实现

    private Card GetCardByToken(string token)
    {
        foreach (var card in cards)
        {
            if (card.Token == token)
            {
                return card;
            }
        }
        return null;
    }

    private Dictionary<string, int> GetRemainingGuarantees()
    {
        var remainingGuarantees = new Dictionary<string, int>();
        foreach (var token in guarantees.Keys)
        {
            remainingGuarantees[token] = guarantees[token] - drawCounters[token];
        }
        return remainingGuarantees;
    }
}
```

### 测试代码


```csharp
Gacha gacha = new Gacha(new Dictionary<string, int>
        {
            { "SSR", 80 },
            //{ "SR", 10 }
        });

// 添加卡片及其概率

gacha.AddCard(new Card("SSR Card", "SSR", 0.01));  // 1% 概率
gacha.AddCard(new Card("SR Card", "SR", 0.05));   // 5% 概率
gacha.AddCard(new Card("R Card", "R", 0.15));    // 15% 概率
gacha.AddCard(new Card("N Card", "N", 0.79));    // 79% 概率

for (var p = 0; p < 10; p++)
{
    // 抽卡
    for (int i = 0; i < 10; i++)
    {
        var drawResult = gacha.DrawCard();
        Console.Write($"抽到一张\t{drawResult.DrawnCard.Name}");

        Console.Write("\t保底次数:");
        foreach (var guarantee in drawResult.RemainingGuarantees)
        {
            Console.Write($"{guarantee.Key}: {guarantee.Value} 剩余抽卡\t");
        }
        Console.WriteLine();
    }
    Console.WriteLine("=====================================");
}
```

### 测试结果

```shell
抽到一张        SR Card 保底次数:SSR: 79 剩余抽卡
抽到一张        N Card  保底次数:SSR: 78 剩余抽卡
抽到一张        N Card  保底次数:SSR: 77 剩余抽卡
抽到一张        N Card  保底次数:SSR: 76 剩余抽卡
抽到一张        N Card  保底次数:SSR: 75 剩余抽卡
抽到一张        N Card  保底次数:SSR: 74 剩余抽卡
抽到一张        N Card  保底次数:SSR: 73 剩余抽卡
抽到一张        N Card  保底次数:SSR: 72 剩余抽卡
抽到一张        N Card  保底次数:SSR: 71 剩余抽卡
抽到一张        N Card  保底次数:SSR: 70 剩余抽卡
=====================================
抽到一张        N Card  保底次数:SSR: 69 剩余抽卡
抽到一张        N Card  保底次数:SSR: 68 剩余抽卡
抽到一张        N Card  保底次数:SSR: 67 剩余抽卡
抽到一张        N Card  保底次数:SSR: 66 剩余抽卡
抽到一张        N Card  保底次数:SSR: 65 剩余抽卡
抽到一张        N Card  保底次数:SSR: 64 剩余抽卡
抽到一张        N Card  保底次数:SSR: 63 剩余抽卡
抽到一张        N Card  保底次数:SSR: 62 剩余抽卡
抽到一张        N Card  保底次数:SSR: 61 剩余抽卡
抽到一张        N Card  保底次数:SSR: 60 剩余抽卡
=====================================
抽到一张        R Card  保底次数:SSR: 59 剩余抽卡
抽到一张        N Card  保底次数:SSR: 58 剩余抽卡
抽到一张        N Card  保底次数:SSR: 57 剩余抽卡
抽到一张        N Card  保底次数:SSR: 56 剩余抽卡
抽到一张        N Card  保底次数:SSR: 55 剩余抽卡
抽到一张        N Card  保底次数:SSR: 54 剩余抽卡
抽到一张        R Card  保底次数:SSR: 53 剩余抽卡
抽到一张        N Card  保底次数:SSR: 52 剩余抽卡
抽到一张        N Card  保底次数:SSR: 51 剩余抽卡
抽到一张        N Card  保底次数:SSR: 50 剩余抽卡
=====================================
抽到一张        N Card  保底次数:SSR: 49 剩余抽卡
抽到一张        N Card  保底次数:SSR: 48 剩余抽卡
抽到一张        N Card  保底次数:SSR: 47 剩余抽卡
抽到一张        N Card  保底次数:SSR: 46 剩余抽卡
抽到一张        N Card  保底次数:SSR: 45 剩余抽卡
抽到一张        R Card  保底次数:SSR: 44 剩余抽卡
抽到一张        N Card  保底次数:SSR: 43 剩余抽卡
抽到一张        N Card  保底次数:SSR: 42 剩余抽卡
抽到一张        N Card  保底次数:SSR: 41 剩余抽卡
抽到一张        N Card  保底次数:SSR: 40 剩余抽卡
=====================================
抽到一张        N Card  保底次数:SSR: 39 剩余抽卡
抽到一张        N Card  保底次数:SSR: 38 剩余抽卡
抽到一张        N Card  保底次数:SSR: 37 剩余抽卡
抽到一张        N Card  保底次数:SSR: 36 剩余抽卡
抽到一张        N Card  保底次数:SSR: 35 剩余抽卡
抽到一张        N Card  保底次数:SSR: 34 剩余抽卡
抽到一张        N Card  保底次数:SSR: 33 剩余抽卡
抽到一张        R Card  保底次数:SSR: 32 剩余抽卡
抽到一张        N Card  保底次数:SSR: 31 剩余抽卡
抽到一张        N Card  保底次数:SSR: 30 剩余抽卡
=====================================
抽到一张        R Card  保底次数:SSR: 29 剩余抽卡
抽到一张        N Card  保底次数:SSR: 28 剩余抽卡
抽到一张        N Card  保底次数:SSR: 27 剩余抽卡
抽到一张        N Card  保底次数:SSR: 26 剩余抽卡
抽到一张        N Card  保底次数:SSR: 25 剩余抽卡
抽到一张        N Card  保底次数:SSR: 24 剩余抽卡
抽到一张        R Card  保底次数:SSR: 23 剩余抽卡
抽到一张        N Card  保底次数:SSR: 22 剩余抽卡
抽到一张        R Card  保底次数:SSR: 21 剩余抽卡
抽到一张        SR Card 保底次数:SSR: 20 剩余抽卡
=====================================
抽到一张        R Card  保底次数:SSR: 19 剩余抽卡
抽到一张        N Card  保底次数:SSR: 18 剩余抽卡
抽到一张        SR Card 保底次数:SSR: 17 剩余抽卡
抽到一张        N Card  保底次数:SSR: 16 剩余抽卡
抽到一张        N Card  保底次数:SSR: 15 剩余抽卡
抽到一张        N Card  保底次数:SSR: 14 剩余抽卡
抽到一张        N Card  保底次数:SSR: 13 剩余抽卡
抽到一张        N Card  保底次数:SSR: 12 剩余抽卡
抽到一张        R Card  保底次数:SSR: 11 剩余抽卡
抽到一张        N Card  保底次数:SSR: 10 剩余抽卡
=====================================
抽到一张        N Card  保底次数:SSR: 9 剩余抽卡
抽到一张        N Card  保底次数:SSR: 8 剩余抽卡
抽到一张        N Card  保底次数:SSR: 7 剩余抽卡
抽到一张        N Card  保底次数:SSR: 6 剩余抽卡
抽到一张        SR Card 保底次数:SSR: 5 剩余抽卡
抽到一张        N Card  保底次数:SSR: 4 剩余抽卡
抽到一张        N Card  保底次数:SSR: 3 剩余抽卡
抽到一张        R Card  保底次数:SSR: 2 剩余抽卡
抽到一张        N Card  保底次数:SSR: 1 剩余抽卡
抽到一张        SSR Card        保底次数:SSR: 80 剩余抽卡
=====================================
抽到一张        N Card  保底次数:SSR: 79 剩余抽卡
抽到一张        N Card  保底次数:SSR: 78 剩余抽卡
抽到一张        N Card  保底次数:SSR: 77 剩余抽卡
抽到一张        N Card  保底次数:SSR: 76 剩余抽卡
抽到一张        N Card  保底次数:SSR: 75 剩余抽卡
抽到一张        N Card  保底次数:SSR: 74 剩余抽卡
抽到一张        N Card  保底次数:SSR: 73 剩余抽卡
抽到一张        N Card  保底次数:SSR: 72 剩余抽卡
抽到一张        R Card  保底次数:SSR: 71 剩余抽卡
抽到一张        N Card  保底次数:SSR: 70 剩余抽卡
=====================================
抽到一张        N Card  保底次数:SSR: 69 剩余抽卡
抽到一张        N Card  保底次数:SSR: 68 剩余抽卡
抽到一张        R Card  保底次数:SSR: 67 剩余抽卡
抽到一张        N Card  保底次数:SSR: 66 剩余抽卡
抽到一张        SSR Card        保底次数:SSR: 80 剩余抽卡
抽到一张        N Card  保底次数:SSR: 79 剩余抽卡
抽到一张        N Card  保底次数:SSR: 78 剩余抽卡
抽到一张        N Card  保底次数:SSR: 77 剩余抽卡
抽到一张        N Card  保底次数:SSR: 76 剩余抽卡
抽到一张        N Card  保底次数:SSR: 75 剩余抽卡
=====================================
```

## 结语

本文介绍了如何利用蓄水池抽样算法实现游戏中的抽卡系统。通过动态计算卡片的概率分布并结合保底机制，确保玩家在一定抽卡次数内能够获得期望的稀有度卡片。这种算法不仅简单高效，而且能够有效控制抽卡结果的随机性，为游戏开发者提供了一种可靠的实现方案。

在实际开发中，开发者可以根据游戏的具体需求调整算法细节，如调整保底次数和卡片的概率分布，以实现更符合游戏平衡性和玩家期待的抽卡系统。
