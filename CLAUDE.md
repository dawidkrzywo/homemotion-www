# homemotion.pl — instrukcja dla Claude

Strona firmowa Home Motion sp. z o.o. (fotografia i filmy nieruchomości, rolki, dron/FPV). Właściciel: Dawid Kołodziejek. Rozmowa po polsku.

## Jak to działa
- Kod: to repo (`dawidkrzywo/homemotion-www`), czysty HTML/CSS/JS, bez kroku budowania.
- Publikacja: Cloudflare Pages, projekt `homemotion-www`. Każdy push na `main` publikuje się sam w ~1 min.
  - adres testowy: https://homemotion-www.pages.dev
  - produkcja: https://www.homemotion.pl
- `homemotion.pl` (bez www) przekierowuje na `www` przez starego WordPressa na LH.pl (Ustawienia → Ogólne → Adres witryny = https://www.homemotion.pl). Nie ruszać tej instalacji.

## Domena, DNS, poczta (nie psuć!)
- Domena zarejestrowana w LH.pl (do 2028-01-17). DNS edytuje się w panelu LH.pl: Serwery → serwer415986 → Strony WWW → homemotion.pl → Edytuj DNS.
- Jedyny wpis strony: `CNAME www → homemotion-www.pages.dev`.
- Poczta `biuro@homemotion.pl` jest na LH.pl (MX mail21.lh.pl, SPF, DKIM, DMARC, CNAME mail/imap/smtp/pop3, SRV autodiscover). Tych wpisów NIE zmieniać.
- Hosting LH.pl (Mango 30 GB) opłacony do 2027-01-26; plan: przenieść pocztę i zrezygnować.

## Treść
- Telefon, e-mail i Instagram: w `main.js` (obiekt `KONTAKT`), podmienia się na całej stronie. Telefon: +48 608 590 939. Instagram: https://www.instagram.com/homemotion.pl/ (linki z atrybutem `data-instagram`).
- Bez cennika na stronie. Grupa docelowa: agenci nieruchomości (pakiety promocyjne: zdjęcia, rolki, dron).
- Planowane: sekcja filmów jak na dji.com/pl (pełnoekranowa plansza, przewijanie strzałką, bez pasków), portfolio realizacji, formularz wyceny.

## Filmy
- Źródła (mastery) użytkownik wrzuca do `E:\Home Motion\.Pliki źródłowe na stronę` na swoim PC. Do repo trafiają tylko wersje skompresowane.
- Wersje na film (bez dźwięku, 30 kl./s, `-movflags +faststart`):
  - H.264 1080p: `-c:v libx264 -preset slower -crf 21 -maxrate 6M -bufsize 12M` (dla wszystkich)
  - AV1 1080p: `-c:v libsvtav1 -preset 8 -crf 38` (lżejsza, dla nowszych przeglądarek)
  - H.264 720p: `-crf 22 -maxrate 3M` (telefony, `media="(max-width: 820px)"`)
  - kadr zastępczy JPG ~400 KB
- Limit Cloudflare Pages: 25 MB na plik. Cel: 3–8 MB na wersję.

## Czcionki
- Napis logo: Michroma 400 (`--f-logo`), tylko w logo. Nagłówki, liczby, telefon: Red Hat Display 800 (`--f-head`). Menu, opisy, przyciski, formularz: Red Hat Text 400–700 (`--f`). Wszystkie z Google Fonts, jeden link w `<head>`. (Geologica + Michroma w nagłówkach odrzucone jako zbyt techniczne.)

## Logo
- Znak: obrys domu (granat #121b2e albo biały) z pomarańczowym trójkątem play (#f0a93b) w środku; napis „Home Motion” Michroma 400 (jedyna grubość; wybrana zamiast Archivo, które było zbyt generyczne). Projekt: plansza Design „Logo Home Motion”, wersja 1.
- W nagłówku znak jest inline SVG ze `stroke="currentColor"` (biały nad filmem, granatowy po przewinięciu).
- Pliki: `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` (główny katalog); `assets/logo/` — `znak-granat.svg`, `znak-bialy.svg`, `ikona.svg`, `ikona-instagram-1080.png` (sam znak), `instagram-profilowe-1080.png` (znak + napis, aktualne profilowe IG), `logo-poziome-granat.png`, `logo-poziome-bialy.png` (przezroczyste tło).

## Realizacje (sesje zdjęciowe)
- Źródła: `E:\Home Motion\.Pliki źródłowe na stronę\Sesje\<nazwa>` na PC użytkownika.
- Opisy z danych lokalu: Airtable (baza Home Motion → Nieruchomości, Kontakty), Notion „Sesje HM”, dokumenty na Drive. Na stronie bez nazwisk i numerów lokali — ulica, dzielnica, metraż, typ sesji, sprzedaż/wynajem.
- Pliki: `assets/sesje/<slug>/NN.webp` (1920 px, q80) i `NN-m.webp` (800 px, q74); kolejność = kolejność w galerii, `01` to okładka.
- Nowa sesja: kafelek w `index.html` (sekcja `#realizacje`, `data-sesja="<slug>"`) + wpis w obiekcie `SESJE` w `main.js` (tytuł, liczba zdjęć).
- Pomijać kadry ze znakiem wodnym (Fotello, gwiazdka AI) i duplikaty.

## Zasady pracy
- Po każdej zmianie: commit + push na `main`, potem sprawdzić homemotion-www.pages.dev.
- Wypisywać użytkownikowi, co się zmieniło na stronie (prostym językiem).
