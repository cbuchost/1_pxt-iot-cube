> Diese Seite bei [https://smartfeld.github.io/pxt-iot-cube/](https://smartfeld.github.io/pxt-iot-cube/) öffnen



## Als Erweiterung verwenden

Dieses Repository kann als **Erweiterung** in MakeCode hinzugefügt werden.

* öffne [https://makecode.microbit.org/](https://makecode.microbit.org/)
* klicke auf **Neues Projekt**
* klicke auf **Erweiterungen** unter dem Zahnrad-Menü
* nach **https://github.com/smartfeld/pxt-iot-cube** suchen und importieren

## Dieses Projekt bearbeiten ![Build Status Abzeichen](https://github.com/smartfeld/pxt-iot-cube/workflows/MakeCode/badge.svg)

Um dieses Repository in MakeCode zu bearbeiten.

* öffne [https://makecode.microbit.org/](https://makecode.microbit.org/)
* klicke auf **Importieren** und dann auf **Importiere URL**
* füge **https://github.com/smartfeld/pxt-iot-cube** ein und klicke auf Importieren

## Datenkonverter für ThingsBoard

Zur Integration der Messdaten ist ThingsBoard vorgesehen. Den dafür nötigen Konverter ist im Ordner ../pxt-iot-cube/converters/things-board-data-converter.js abgelegt und kann bei Bedarf eingesetzt werden.

### Testen von Github Pages

Github pages basiert auf jekyll und kann mithilfe der Anleitung in einer lokalen Testumgebung überprüft werden: https://jekyllrb.com/docs/

```shell
# Run inside root folder of github repository
bundle exec jekyll serve
```


#### Metadaten (verwendet für Suche, Rendering)

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>
