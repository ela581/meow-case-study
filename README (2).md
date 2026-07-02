# Meow — İçerik Üretim Hattı (Otomasyon Prototipi)

Bu proje, Tessera Lab & Oktavis staj programı kapsamında hazırladığım Meow vaka analiz
raporunun 10. maddesinde ("Otomasyon Planı") önerdiğim AI destekli içerik üretim
sisteminin çalışan bir örneğidir.

## Ne yapıyor?

Üç aşamalı bir hat simüle ediyor:

1. **Anahtar Kelime Tespiti** — Meow'un hedef kitlesine (girişim kurucuları, kripto
   şirketleri) uygun, arama hacmi ve zorluk skoru ile birlikte sunulan konu önerileri.
   *(Not: Bu demoda liste sabit/örnek verilerle gösteriliyor; gerçek sistemde bu adım
   Ahrefs benzeri bir araçtan canlı veri çekerek çalışır.)*
2. **Taslak Üretimi (Gemini)** — Seçilen anahtar kelime için Gemini API'ye gerçek zamanlı
   bir istek gönderiliyor ve TCREI yöntemiyle (Görev / Bağlam / Referans / Değerlendirme /
   İterasyon) yapılandırılmış bir prompt ile blog taslağı üretiliyor.
3. **İçerik Takvimi** — Üretilen her taslak otomatik olarak haftalık kadansla takvime
   ekleniyor, editör onayı bekleyen durum etiketiyle gösteriliyor.

## Neden bu sistemi seçtim?

Vaka analizimde dört otomasyon alanından pazarlamayı seçmiştim çünkü Meow'un büyümesi
büyük ölçüde arama motoru trafiğine dayanıyor. Raporumda hesapladığım gibi, bu sistem
aylık ~3.600 dolar tasarruf sağlıyor ve kurulum maliyeti ~2,5 ayda geri dönüyor.

## Kullanılan teknolojiler

- React (tek dosyalık bileşen)
- Google Gemini API (gerçek zamanlı taslak üretimi)
- Tasarım: teal/koyu yeşil tonlarda, tech-forward bir arayüz

## Dosyalar

- `ContentPipeline.jsx` — çalışan demo
- Demo videosu: https://youtube.com/shorts/KzPiABamUVY?si=9_61_gpDe1AX4Hn7
  (alternatif format: https://www.youtube.com/watch?v=KzPiABamUVY)

## Vaka Analizi Raporu

Tam rapor (PDF) için: `Meow_CaseStudy_Elanur.pdf`

---
Hazırlayan: Elanur Türe · İzmir Bakırçay Üniversitesi, Bilgisayar Mühendisliği
