;Language: Azerbaijani (2092)
;By All1page project

!insertmacro LANGFILE "Azerbaijani" = "Azərbaycan" =

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) Quraşdırma Sihirbazına Xoş Gəlmisiniz"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "Sihirbaz sizi $(^NameDA) proqramının quraşdırılması boyunca istiqamətləndirəcək.$\r$\n$\r$\nQuraşdırmaya başlamazdan əvvəl digər bütün proqramları bağlamağınız tövsiyə olunur. Bu, kompüterinizi yenidən başlatmadan müvafiq sistem fayllarını yeniləməyə imkan verəcək.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) Silmə Sihirbazına Xoş Gəlmisiniz"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "Sihirbaz sizi $(^NameDA) proqramının silinməsi boyunca istiqamətləndirəcək.$\r$\n$\r$\nSilməyə başlamazdan əvvəl $(^NameDA) proqramının işləmədiyinə əmin olun.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "Lisenziya Müqaviləsi"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) proqramını quraşdırmazdan əvvəl lisenziya şərtlərini nəzərdən keçirin."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "Müqavilənin şərtlərini qəbul edirsinizsə, davam etmək üçün Qəbul Edirəm düyməsini klikləyin. $(^NameDA) proqramını quraşdırmaq üçün müqaviləni qəbul etməlisiniz."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "Müqavilənin şərtlərini qəbul edirsinizsə, aşağıdakı qeyd qutusunu işarələyin. $(^NameDA) proqramını quraşdırmaq üçün müqaviləni qəbul etməlisiniz. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Müqavilənin şərtlərini qəbul edirsinizsə, aşağıdakı birinci seçimi seçin. $(^NameDA) proqramını quraşdırmaq üçün müqaviləni qəbul etməlisiniz. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "Lisenziya Müqaviləsi"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA) proqramını silməzdən əvvəl lisenziya şərtlərini nəzərdən keçirin."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "Müqavilənin şərtlərini qəbul edirsinizsə, davam etmək üçün Qəbul Edirəm düyməsini klikləyin. $(^NameDA) proqramını silmək üçün müqaviləni qəbul etməlisiniz."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "Müqavilənin şərtlərini qəbul edirsinizsə, aşağıdakı qeyd qutusunu işarələyin. $(^NameDA) proqramını silmək üçün müqaviləni qəbul etməlisiniz. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Müqavilənin şərtlərini qəbul edirsinizsə, aşağıdakı birinci seçimi seçin. $(^NameDA) proqramını silmək üçün müqaviləni qəbul etməlisiniz. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "Müqavilənin qalan hissəsini görmək üçün Page Down düyməsini basın."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "Komponentləri Seçin"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "$(^NameDA) proqramının quraşdırmaq istədiyiniz xüsusiyyətlərini seçin."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "Komponentləri Seçin"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "$(^NameDA) proqramının silmək istədiyiniz xüsusiyyətlərini seçin."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "Təsvir"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Komponentin təsvirini görmək üçün siçanın kursorunu onun üzərinə gətirin."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Komponentin təsvirini görmək üçün onu seçin."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "Quraşdırma Yerini Seçin"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) proqramının quraşdırılacağı qovluğu seçin."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "Silmə Yerini Seçin"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) proqramının silinəcəyi qovluğu seçin."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "Quraşdırılır"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) quraşdırılarkən lütfən gözləyin."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "Quraşdırma Tamamlandı"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "Quraşdırma uğurla tamamlandı."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "Quraşdırma Dayandırıldı"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "Quraşdırma uğurla tamamlanmadı."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "Silinir"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) silinərkən lütfən gözləyin."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Silmə Tamamlandı"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "Silinmə uğurla tamamlandı."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "Silmə Dayandırıldı"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "Silinmə uğurla tamamlanmadı."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) Quraşdırması Tamamlanır"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) kompüterinizə quraşdırıldı.$\r$\n$\r$\nQuraşdırmanı bağlamaq üçün Bitir düyməsini klikləyin."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) quraşdırılmasını tamamlamaq üçün kompüterinizi yenidən başlatmalısınız. İndi yenidən başlatmaq istəyirsiniz?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) Silinməsi Tamamlanır"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) kompüterinizdən silindi.$\r$\n$\r$\nSilməni bağlamaq üçün Bitir düyməsini klikləyin."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) silinməsini tamamlamaq üçün kompüterinizi yenidən başlatmalısınız. İndi yenidən başlatmaq istəyirsiniz?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "İndi yenidən başlat"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "Daha sonra əl ilə yenidən başlatmaq istəyirəm"
  ${LangFileString} MUI_TEXT_FINISH_RUN "&$(^NameDA) proqramını işə sal"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme faylını göstər"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "&Bitir"
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Başlat Menyusu Qovluğunu Seçin"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) qısa yolları üçün Başlat menyusu qovluğu seçin."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "Proqramın qısa yollarının yaradılmasını istədiyiniz Başlat menyusu qovluğunu seçin. Yeni qovluq yaratmaq üçün bir ad da daxil edə bilərsiniz."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "Qısa yollar yaratma"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA) proqramını sil"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "$(^NameDA) proqramını kompüterinizdən çıxarın."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "$(^Name) quraşdırmasından çıxmaq istədiyinizə əminsiniz?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "$(^Name) silinməsindən çıxmaq istədiyinizə əminsiniz?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "İstifadəçiləri Seçin"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "$(^NameDA) proqramını hansı istifadəçilər üçün quraşdırmaq istədiyinizi seçin."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "$(^NameDA) proqramını yalnız özünüz üçün, yoxsa bu kompüterin bütün istifadəçiləri üçün quraşdırmaq istədiyinizi seçin. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Bu kompüterdən istifadə edən hər kəs üçün quraşdırın"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Yalnız mənim üçün quraşdırın"
!endif