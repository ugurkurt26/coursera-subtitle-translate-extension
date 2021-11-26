//author= Mücahit Sahin
//github=https://github.com/mucahit-sahin


async function openBilingual () {
  
  let tracks = document.getElementsByTagName('track')
  let en
  
  if (tracks.length) {

    for (let i = 0; i < tracks.length; i++) 
    {
      if (tracks[i].srclang === 'en')
      {
        en = tracks[i]
      }
    }

    if (en)
    {
      en.track.mode = 'showing'

      await sleep(500)
      
      let cues_org = en.track.cues
      let tempcues = [];
      for(let i=0;i<cues_org.length;i++)
      {
          tempcues.push(cues_org[i].text)

      }
      var cues = JSON.parse(JSON.stringify(tempcues));
      
      var endSentence = []
      for(let i=0;i<cues.length;i++)
      {
        if(cues[i+1] != undefined)
        {
          if(cues[i+1][0] == cues[i+1][0].toUpperCase() || cues[i+1][1] == cues[i+1][1].toUpperCase())
          {
            if(cues[i][cues[i].length-1] == '.')
              endSentence.push(i)
            else if(cues[i][cues[i].length-1] == '?')
              endSentence.push(i)
            else if(cues[i][cues[i].length-1] == '!')
              endSentence.push(i)
          }
        }
      }
      endSentence.push(cues.length-1)

      var cuesTextList = getTexts(cues)

      for(let n=0;n<=cuesTextList.length;n++)
      {
        getTranslation(cuesTextList[n].text, translatedText => 
          { 

          var translatedList = translatedText.split('_ * _')

          for(let i=cuesTextList[n].start;i<=cuesTextList[n].end;i++)
          {
            if(i!=0)
            {
              if(translatedList[i-cuesTextList[n].start][0] == ".")
                translatedList[i-cuesTextList[n].start] = translatedList[i-cuesTextList[n].start].substring(1)
              else if(translatedList[i-cuesTextList[n].start][1] == ".")
                translatedList[i-cuesTextList[n].start] = translatedList[i-cuesTextList[n].start].substring(2)
                
              for(let j=endSentence[i-1]+1;j<=endSentence[i];j++)
              {
                cues_org[j].text = translatedList[i-cuesTextList[n].start]
              }
            }
            else
            {
              for(let j=0;j<=endSentence[i];j++)
              {
                cues_org[j].text = translatedList[i]
              }
            }
          }
        });
        await sleep(500)
      };

    }
  }
}

String.prototype.replaceAt = function(index, replacement) {
  return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getTexts(cues_sep)
{
    let cuesTextList = ""
    for(let i=0;i < cues_sep.length;i++)
    {
      if(cues_sep[i+1] != undefined)
      {
        if(cues_sep[i+1][0] == cues_sep[i+1][0].toUpperCase() || cues_sep[i+1][1] == cues_sep[i+1][1].toUpperCase())
        {
          if(cues_sep[i][cues_sep[i].length-1] == '.')
            cues_sep[i] = cues_sep[i].replaceAt(cues_sep[i].length-1, "._~_")
          else if(cues_sep[i][cues_sep[i].length-1] == '?')
            cues_sep[i] = cues_sep[i].replaceAt(cues_sep[i].length-1, "?_~_")
          else if(cues_sep[i][cues_sep[i].length-1] == '!')
            cues_sep[i] = cues_sep[i].replaceAt(cues_sep[i].length-1, "!_~_")
        }
      }

      cues_sep[i] = cues_sep[i].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
      cuesTextList+= cues_sep[i].replace(/\n/g, ' ') + " "
    }
    
    var cuesSepList = cuesTextList.split('_~_')

    let listOutput = []
    let text = "";
    let j = 0;
    let i =0;

    while(i<cuesSepList.length)
    {
        if(text.length>4000)
        {
            listOutput.push({text : text , start : j , end : i-1});
            text = "";
            j = i;
            
        }
        else
        {   var temp_punctuation = cuesSepList[i][cuesSepList[i].length-1]+" _ * _ . "
            temp_punctuation = cuesSepList[i].substr(0,cuesSepList[i].length-1) + temp_punctuation
            cuesSepList[i] = temp_punctuation
            text+=cuesSepList[i]
            i++;
        }

    }
    listOutput.push({text : text , start : j , end : cuesSepList.length-1});

    return listOutput
}


function getTranslation (words, callback) {

 const xhr = new XMLHttpRequest()
 let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&q=${encodeURI(words)}`
  xhr.open('GET', url, true)
  xhr.responseType = 'text'
  xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
      if (xhr.status === 200 || xhr.status === 304) {
      
        const translatedList = JSON.parse(xhr.responseText)[0]
        let translatedText = ''
        for (let i = 0; i < translatedList.length; i++) {
          translatedText += translatedList[i][0]
        }
        callback(translatedText)
      }
    }
  }
  xhr.send()
}

chrome.runtime.onMessage.addListener
(
  function (request, sender) {
    openBilingual()
  }
)
