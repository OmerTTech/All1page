; Kurulumda seçilen NSIS dili (örn. 1033=English, 1055=Türkçe, 2092=Azərbaycan)
; HKCU'ya yazılır; uygulama ilk açılışta bu değeri okuyup arayüz dilini buna göre seçer.

!macro customInit
  WriteRegStr HKCU "Software\All1page" "InstallerLang" "$LANGUAGE"
!macroend