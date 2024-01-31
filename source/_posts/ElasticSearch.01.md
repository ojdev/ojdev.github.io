---
title: ElasticSearch查询group by maxdate的一个写法
date: 2023-02-14 10:19:02
updated:  2023-02-14 10:19:00
mermaid: true
categories:
- [软件开发, .Net, 小技巧]
tags:
 - ElasticSearch
 - 聚合桶
---

ElasticSearch如果只是用来做查询当然是很好的，但是往往还有很多需要用来做统计的地方，然而对于了解不深的人来说，有些查询很难去写，比如我们的一个需求是这样的

| date | exportData.交易类型 | exportData.业绩类型.keyword | jYCode | brokerId | exportData.订单总应收 | exportData.成交价格 | exportData.分边业绩 |
|----|----|----|----|----|----|----|----|
|2022-01-02| 二手 | 正业绩 | 0000001 | 人员1 | 10086 | 1000000 | 100 |
|2022-01-01| 二手 | 正业绩 | 0000001 | 人员1 | 10088 | 1000000 | 150 |
|2022-01-02| 二手 | 正业绩 | 0000001 | 人员2 | 10086 | 1000000 | 8 |
|2022-01-01| 二手 | 正业绩 | 0000001 | 人员2 | 10088 | 1000000 | 0.5 |

统计要求是这样的，先按照人员为分组单位，然后将业绩累加，然后按照时间倒序取最新一条的总计，这就涉及到一个group by 和group by 内部的查询，起初我用了scripted_metric，但是当我取10年的数据时如果是单字段还好，但是需求中涉及到20多个字段，那么就有了性能问题。

而且由于是 ElasticSearch6.x的限制，很多7以上的新API也无法使用，查阅多方资料加上ChatGPT进行修正后得到了一个性能相对好一些的写法。

```json
GET trans_performance_day_snapshot/_search
{
  "query": {
    "bool": {
      "must": [
        {
          "term": {
            "companyId": {
              "value": ""
            }
          }
        },
        {
          "range": {
            "date": {
              "gte": "2000-10-01",
              "lte": "2077-01-01",
              "time_zone": "+08:00",
              "format": "yyyy-MM-dd"
            }
          }
        }
      ]
    }
  },
  "aggs": {
    "brokerId": {
      "terms": {
        "field": "brokerId",
        "size": 99999
      },
      "aggs": {
        "brokerInfo": {
          "top_hits": {
            "size": 1,
            "sort": [
              {
                "date": {
                  "order": "desc"
                }
              }
            ],
            "_source": [
              "userOrganization.brokerName",
              "userOrganization.storeName",
              "userOrganization.storeLeaderName",
              "userOrganization.regionId",
              "userOrganization.regionName",
              "userOrganization.regionLeaderName",
              "userOrganization.bigRegionId",
              "userOrganization.bigRegionName",
              "userOrganization.bigRegionLeaderName"
            ]
          }
        },
        "trade": {
          "terms": {
            "field": "exportData.交易类型.keyword"
          },
          "aggs": {
            "performanceType": {
              "terms": {
                "field": "exportData.业绩类型.keyword"
              },
              "aggs": {
                "performance": {
                  "sum": {
                    "field": "exportData.分边业绩"
                  }
                },
                "totalCount": {
                  "cardinality": {
                    "field": "jYCode"
                  }
                },
                "listingCommission": { ## 1 这里，按照订单编号分组
                  "terms": {
                    "field": "jYCode"
                  },
                  "aggs": {
                    "group_by_date": { ## 2 在按照时间分组
                      "terms": {
                        "field": "date",
                        "order": {
                          "max_date": "desc"
                        }
                      },
                      "aggs": {
                        "max_date": { ## 3 聚合出最大的日期的那条数据
                          "max": {
                            "field": "date"
                          }
                        },
                        "sum_order_receivable": { ## 4 累加，但是因为只有一条数据，其实就是取值
                          "sum": {
                            "field": "exportData.订单总应收"
                          }
                        },
                        "sum_transaction_price": { ## 4 累加，但是因为只有一条数据，其实就是取值
                          "sum": {
                            "field": "exportData.成交价格"
                          }
                        }
                      }
                    },
                    "sum_order_receivable": { ## 5 将这里是为了外层的统计，虽然也是累加，但是取值依然是订单编号中最新的那条数据的值
                      "sum_bucket": {
                        "buckets_path": "group_by_date>sum_order_receivable"
                      }
                    },
                    "sum_transaction_price": { ## 5 将这里是为了外层的统计，虽然也是累加，但是取值依然是订单编号中最新的那条数据的值
                      "sum_bucket": {
                        "buckets_path": "group_by_date>sum_transaction_price"
                      }
                    }
                  }
                },
                "sum_order_receivable": { ## 6 在这里，才是是按照exportData.业绩类型.keyword 分组后  将改人员涉及到的每个订单中的最新一条数据中的值累加起来的和
                  "sum_bucket": {
                    "buckets_path": "listingCommission>sum_order_receivable"
                  }
                },
                "sum_transaction_price": { ## 6 在这里，才是是按照exportData.业绩类型.keyword 分组后 将改人员涉及到的每个订单中的最新一条数据中的值累加起来的和
                  "sum_bucket": {
                    "buckets_path": "listingCommission>sum_transaction_price"
                  }
                }
              }
            },
            "sum_order_receivable": {  ## 7 在这里，是按照exportData.交易类型.keyword 分组后的 ##6 这个步骤的值的和
              "sum_bucket": {
                "buckets_path": "performanceType>sum_order_receivable"
              }
            },
            "sum_transaction_price": { ## 7 在这里，是按照exportData.交易类型.keyword 分组后的 ##6 这个步骤的值的和
              "sum_bucket": {
                "buckets_path": "performanceType>sum_transaction_price"
              }
            }
          }
        }
      }
    }
  },
  "size": 0
}

```

上面内容的aggs与之对应的C#部分的代码如下

```csharp
        private async Task<AggregationDictionary> GenerateAggregationDictionary(string groupByName, Field field, int skip, int take)
        {
            var aggs = new AggregationDictionary();
            await _elastic.IndexPutAsync<StringResponse>(IndexTypeName.PerformanceDaySnapshot, "_settings", PostData.String("{\"index.max_result_window\":99999,\"index.max_inner_result_window\":99999}"));
            await _elastic.IndexPutAsync<StringResponse>("/_cluster", "_settings", PostData.String("{ \"persistent\": { \"search.max_buckets\": 99999 }}"));
            var c_group = new AggregationDictionary
            {
                {
                    "brokerInfo",
                        new TopHitsAggregation("brokerInfo")
                        {
                            Size = 1,
                            Sort = new List<ISort>
                            {
                                new SortField { Field = Infer.Field<PerformanceDaySnapshot>(p => p.Date), Order = SortOrder.Descending }
                            },
                            Source = new SourceFilter
                            {
                                Includes = new[] {
                                    "userOrganization.brokerName",
                                    "userOrganization.storeId",
                                    "userOrganization.storeName",
                                    "userOrganization.storeLeaderName",
                                    "userOrganization.regionId",
                                    "userOrganization.regionName",
                                    "userOrganization.regionLeaderName",
                                    "userOrganization.bigRegionId",
                                    "userOrganization.bigRegionName",
                                    "userOrganization.bigRegionLeaderName"
                                }
                            }
                        }
                },
                {
                    "trade",
                        new TermsAggregation("trade")
                        {
                            Field = new Field("exportData.交易类型.keyword"),
                            Aggregations = new TermsAggregation("performanceType")
                            {
                                Field = new Field("exportData.业绩类型.keyword"),
                                Aggregations =
                                    new SumAggregation("performance", new Field("exportData.分边业绩")) { Missing = 0 }
                                    && new CardinalityAggregation("totalCount", Infer.Field<PerformanceDaySnapshot>(f=>f.JYCode))
                                    && new TermsAggregation("listingCommission")
                                    {
                                        Field = Infer.Field<PerformanceDaySnapshot>(f=>f.JYCode),
                                        Aggregations = new TermsAggregation("group_by_date")
                                        {
                                            Field = Infer.Field<PerformanceDaySnapshot>(f=>f.Date),
                                            Order = new TermsOrder[]
                                            {
                                                new TermsOrder { Key = "max_date", Order = SortOrder.Descending }
                                            },
                                            Aggregations = new MaxAggregation("max_date", Infer.Field<PerformanceDaySnapshot>(f=>f.Date))
                                                           && new SumAggregation("sum_order_receivable", new Field("exportData.订单总应收"))
                                                           && new SumAggregation("sum_transaction_price", new Field("exportData.成交价格"))
                                        }
                                        && new SumBucketAggregation("sum_order_receivable", new SingleBucketsPath("group_by_date>sum_order_receivable"))
                                        && new SumBucketAggregation("sum_transaction_price", new SingleBucketsPath("group_by_date>sum_transaction_price"))
                                    }
                                    && new SumBucketAggregation("commission", new SingleBucketsPath("listingCommission>sum_order_receivable"))
                                    && new SumBucketAggregation("transactionPrice", new SingleBucketsPath("listingCommission>sum_transaction_price"))
                            }
                        }
                },
                {
                    "c_bucket_sort",
                    new BucketSortAggregation("c_bucket_sort")
                    {
                        From = skip, //分页skip
                        Size = take  //分页take
                    }
                }
            };

            aggs.Add("item_count", new CardinalityAggregation("item_count", new Field(groupByName))); //group by 中的totalCount
            aggs.Add(groupByName, new TermsAggregation(groupByName)
            {
                Field = field,//group by 的列
                Size = 10000,
                Aggregations = c_group
            });
            return aggs;
        }
```
