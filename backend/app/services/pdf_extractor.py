import fitz  # PyMuPDF library (packaged as PyMuPDF, imported as fitz)

def extract_pdf_text(file_bytes: bytes):
    """
    Extracts raw text blocks from PDF bytes, sorting them to maintain layout order 
    (handling double-column and single-column formatting baselines).
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = ""
    all_blocks = []
    
    for page in doc:
        # Get blocks: list of (x0, y0, x1, y1, text, block_no, block_type)
        blocks = page.get_text("blocks")
        if not blocks:
            continue
            
        page_width = page.rect.width
        mid_x = page_width / 2
        
        # Heuristic sorting for standard two-column developer resumes
        left_column = []
        right_column = []
        
        for b in blocks:
            x0, y0, x1, y1, text_content, block_no, block_type = b
            text_content = text_content.strip()
            if not text_content:
                continue
                
            # Classify columns based on overlap with the center line
            if x1 <= mid_x:
                left_column.append(b)
            elif x0 >= mid_x:
                right_column.append(b)
            else:
                # If block spans across mid-line, check major alignment
                left_span = mid_x - x0
                right_span = x1 - mid_x
                if left_span > right_span:
                    left_column.append(b)
                else:
                    right_column.append(b)
                    
        # Sort each column vertically (top-to-bottom)
        left_sorted = sorted(left_column, key=lambda x: x[1])
        right_sorted = sorted(right_column, key=lambda x: x[1])
        
        # Combine columns (left first, then right to maintain reading order)
        sorted_page_blocks = left_sorted + right_sorted
        
        page_text = ""
        for b in sorted_page_blocks:
            x0, y0, x1, y1, text_content, block_no, block_type = b
            text_content = text_content.strip()
            page_text += text_content + "\n"
            all_blocks.append({
                "bbox": [x0, y0, x1, y1],
                "text": text_content
            })
            
        full_text += page_text + "\n"
        
    return full_text, all_blocks
