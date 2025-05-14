import pandas as pd

def save_to_excel(data):
    df = pd.DataFrame(data)
    file_path = "static/output.xlsx"
    df.to_excel(file_path, index=False)
    return file_path
