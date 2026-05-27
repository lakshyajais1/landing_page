import re

def extract(in_file, out_file):
    with open(in_file, 'r') as f:
        content = f.read()
    
    # We want to extract lines that look like "line_num: source_code"
    # Actually, from the view_file output format:
    # "The following code has been modified to include a line number before every line... \n1: import..."
    
    lines = content.split('\n')
    extracted = []
    
    for line in lines:
        match = re.match(r'^\d+:\s(.*)$', line)
        if match:
            extracted.append(match.group(1))
        elif re.match(r'^\d+:$', line):
            extracted.append('')
            
    with open(out_file, 'w') as f:
        f.write('\n'.join(extracted))

extract('transcript_step_9.txt', 'src/PixeoGallery.tsx')
extract('transcript_step_12.txt', 'src/PixeoGallery.css')
