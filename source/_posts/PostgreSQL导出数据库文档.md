---
title: PostgreSQL导出数据库文档
date: 2023-02-24 20:16:00
updated:  2023-02-24 20:16:00
categories:
- [软件开发, 运维]
tags:
- PostgreSQL
- 数据库文档
---


```sql
DO $$ DECLARE
tab RECORD;
rec RECORD;
BEGIN

FOR  tab IN SELECT schemaname||'.'||'"'||tablename||'"' AS "TBName",t.tablename,obj_description(c.oid) AS "Description" FROM pg_tables t LEFT JOIN pg_class c ON t.tablename = c.relname WHERE t.schemaname='public' AND t.tablename!='__EFMigrationsHistory' LOOP
	  RAISE NOTICE '表名：%',tab."TBName";
		RAISE NOTICE '';
		RAISE NOTICE '> %',tab."Description";
		RAISE NOTICE '';
		RAISE notice '| 序号 | 字段名称 | 类型及长度 | 是否可空 | 注释 |';
    RAISE notice '|----|----|----|----|----|';
			FOR rec IN SELECT ROW_NUMBER ( ) OVER ( ) AS 序号, A.attname AS 字段名称, format_type ( A.atttypid, A.atttypmod ) AS 类型及长度, A.attnotnull AS 是否可空, col_description ( A.attrelid, A.attnum ) AS 注释 FROM pg_class AS C, pg_attribute AS A WHERE C.relname = tab."tablename" AND A.attrelid = C.oid AND A.attnum > 0
		LOOP
			RAISE notice '| % | % | % | % | % |', rec."序号", rec."字段名称", rec."类型及长度", rec."是否可空", rec."注释";
		END LOOP;
		RAISE NOTICE '';
	END LOOP;
END;
$$ LANGUAGE plpgsql;
```
