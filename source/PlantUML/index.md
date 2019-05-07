---
title: PlantUML
date: 2019-05-07 15:09:06
---

~~~puml
@startuml
title 流程图

scale 2
start
:用户名|

if(用户是否存在) then(yes)
    :登录;
else (no)
    :注册;
endif

while (获取用户权限) is (角色)
    :权限列表;
endwhile
fork
    :菜单1;
fork again
    :菜单2;
fork again
    :菜单3;
end fork
:操作;

stop
@enduml
~~~