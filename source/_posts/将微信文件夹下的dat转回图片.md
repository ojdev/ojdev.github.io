---
title: 将微信文件夹下的dat转回图片
date: 2023-07-02 09:24:00
updated:  2023-07-02 09:24:00
mermaid: false
categories:
- 知识储备
tags:
 - python
 - 微信
 - 图片
 - 解密
---

```python
import os
into_path = r'E:\Documents\WeChat Files\luacloud\FileStorage\Image\\'[:-1]  #请将想导入的dat文件的路径复制到引号里面，修改此处代码				
out_path = r"D:\WeixinImages\\"[:-1]  #运行代码前记得修改导出路径

def imageDecode(f, fn):
    dat_read = open(f, "rb")  
    xo = Format(f)  							
    out = out_path + fn + ".jpg"  					
    print("导出文件的路径{}".format(out), end='\n\n')
    png_write = open(out, "wb")  				
    dat_read.seek(0)  								

    for now in dat_read:  							
        for nowByte in now:
            newByte = nowByte ^ xo  				
            png_write.write(bytes([newByte])) 

    dat_read.close()
    png_write.close()

def findFile(f):
    fsdir = os.listdir(f)  					
    # print(fsdir)
    for finfo in fsdir:  					
        print(into_path + finfo)
        fsinfo = os.listdir(into_path + finfo) 
        for fn in fsinfo:  								
            temp_path = os.path.join(into_path + finfo, fn)  			
            if os.path.isfile(temp_path):  
                print('导入的文件路径是{}'.format(temp_path))
                fn = fn[:-4]  							
                imageDecode(temp_path, fn)  			
            else:
                pass 			
        else:
            pass

def Format(f):
    dat_r = open(f, "rb")
    try:
        a = [(0x89, 0x50, 0x4e), (0x47, 0x49, 0x46), (0xff, 0xd8, 0xff)]
        for now in dat_r:
            for xor in a:
                i = 0
                res = []
                nowg = now[:3]						
                for nowByte in nowg:
                    res.append(nowByte ^ xor[i])	
                    i += 1
                if res[0] == res[1] == res[2]:	
                    return res[0]					
    except:
        pass
    finally:
        dat_r.close()

if __name__ == '__main__':
    findFile(into_path)
```
