import pandas as pd
import os

# Path file CSV
csv_path = './recommendation-service/data/processed_clothing_with_eval.csv'

def migrate_csv_categories():
    """
    Migrasi kategori dalam file CSV dari:
    - topwear → Top Wear  
    - bottomwear → Bottom Wear
    - winterwear → Top & Bottom Wear
    """
    
    if not os.path.exists(csv_path):
        print(f"❌ File tidak ditemukan: {csv_path}")
        return
    
    try:
        # Baca CSV
        df = pd.read_csv(csv_path, delimiter=';')
        print(f"📂 Loaded {len(df)} rows from CSV")
        
        # Mapping kategori
        category_mapping = {
            'topwear': 'Top Wear',
            'bottomwear': 'Bottom Wear', 
            'winterwear': 'Top & Bottom Wear'
        }
        
        # Update kategori di kolom yang relevan
        for old_cat, new_cat in category_mapping.items():
            # Update kolom subCategory (kolom ke-3, index 2)
            if 'subCategory' in df.columns:
                mask = df['subCategory'] == old_cat
                df.loc[mask, 'subCategory'] = new_cat
                print(f"📝 Updated {mask.sum()} rows: {old_cat} → {new_cat}")
            
            # Update kolom combo_features jika ada (kolom ke-4, index 3)
            if 'combo_features' in df.columns:
                df['combo_features'] = df['combo_features'].str.replace(f' {old_cat}', f' {new_cat}')
                
        # Simpan kembali
        backup_path = csv_path + '.backup'
        df.to_csv(backup_path, sep=';', index=False)
        print(f"💾 Backup saved to: {backup_path}")
        
        df.to_csv(csv_path, sep=';', index=False)
        print(f"✅ Updated CSV saved to: {csv_path}")
        
        # Summary setelah update
        print("\n📊 Summary setelah migrasi:")
        if 'subCategory' in df.columns:
            category_counts = df['subCategory'].value_counts()
            for category, count in category_counts.items():
                print(f"   {category}: {count} products")
                
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    migrate_csv_categories()
