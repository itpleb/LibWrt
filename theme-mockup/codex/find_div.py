import re
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
index_path = os.path.join(script_dir, 'index.html')
t=open(index_path,'r',encoding='utf-8').read()
lines=t.split('\n')
stack=[]
for i,line in enumerate(lines,1):
    for m in re.finditer(r'<(/?)div\b[^>]*>', line):
        tag=m.group(0)
        is_close=m.group(1)=='/'
        if is_close:
            if stack: stack.pop()
        else:
            stack.append((m.group(0), i+1))
print('Remaining open divs:', stack)