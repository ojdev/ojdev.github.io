---
title: 常用的代码剪辑
date: 2022-02-07 09:52:51
categories:
- [软件开发, .Net, 小技巧]
tags:
    - C#
    - CSharp
    - 开发
---

# JSON

## System.Text.Json.Serialization

### JsonExtensionData 处理溢出 JSON

反序列化时，可能会在 JSON 中收到不是由目标类型的属性表示的数据。可以将这些无法由目标类型的属性表示的数据储存在一个Dictionary<string, JsonElement>字典里面。

```csharp
/// <summary>
/// 储存反序列化时候的溢出数据
/// </summary>
[JsonExtensionData]
public Dictionary<string, JsonElement> ExtensionData { get; set; }
```

### JsonInclude 包含特定public字段和非公共属性访问器

在序列化或反序列化时，使用 JsonSerializerOptions.IncludeFields 全局设置或 `[JsonInclude]` 特性来包含字段（必须是public），当应用于某个属性时，指示非公共的 getter 和 setter 可用于序列化和反序列化。 不支持非公共属性。

```csharp
/// <summary>
/// 
/// </summary>
[JsonInclude]
public long age = 1000;

/// <summary>
/// 
/// </summary>
[JsonInclude]
public string Name { private get; set; } 
```
