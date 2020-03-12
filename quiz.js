
	function getStateValue(param)
	{
		string = window.location.hash;
		string = string.substring(1);
		values = string.split("~");
		return $.inArray(param, values) != -1;
	}

	function setStateValue(param)
	{
		if (!getStateValue(param))
		{
			window.location.hash += "~" + param;
		}
	}
	
	$().ready(function() {
		document.title = d.title;
        /*
        if (document.fullScreenElement == null)
        {
            var wrapper = $(".wrapper");
            wrapper.html("<div class='overviewContainer'><span style='font-size:180px; cursor: pointer'>Go fullscreen!</span></div>");
            $(".wrapper").click(function() {
              if ((document.fullScreenElement && document.fullScreenElement !== null) ||    
               (!document.mozFullScreen && !document.webkitIsFullScreen)) {
                if (document.documentElement.requestFullScreen) {  
                  document.documentElement.requestFullScreen();  
                } else if (document.documentElement.mozRequestFullScreen) {  
                  document.documentElement.mozRequestFullScreen();  
                } else if (document.documentElement.webkitRequestFullScreen) {  
                  document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);  
                }  
              }
              init();
            });

        } else {
        */
            init();  
	});

	function toggleBlur(sender) {
		var playstate = $(sender).css('animation-play-state')
		if (playstate === 'running') {	
			playstate = 'paused';
		} else if (playstate === 'paused') {
			playstate = 'running';
		}

		if (playstate) {	
			$(sender).css('animation-play-state', playstate);
		}
			
	}

    function init()
      {
            if (!getStateValue("i"))
            {
                showIntro(d.intro);
            } else {
                showOverview();
            }
          
      }

	function showIntro(introFile)
	{
		setStateValue("i");
		$(".wrapper").html(
			"<a id='link'><div class='videoContainer'><video controls><source src='" + introFile + "' type='video/mp4'></video></div></a>"
		);
		$("#link").click(function() { showOverview(); });
	}

	function showOverview()
	{
		html = "<div class='overviewContainer'><h1>" + d.title + "</h1><table><thead><tr>";

		var maxCount = 0;
		for (idx in d.categories)
		{
			html += '<td>' + d.categories[idx].category + '</td>';
			maxCount = Math.max(maxCount, d.categories[idx].questions.length);
		}
		html += "</tr></thead>";

		for (var i = 0; i < maxCount; i++)
		{
			html += '<tr>'
			for (idx in d.categories)
			{
				qId = idx + '/' + i
				if (getStateValue(qId)) { asked = "asked " } else { asked = "" }
				if (d.categories[idx].questions[i].caption == null) {
					caption = i+1;
				} else {
					caption = d.categories[idx].questions[i].caption;
				}
				html += '<td';
				if (typeof d.categories[idx].questions[i] != 'undefined') 
				{ 
					html += ' class="' + asked + 'qLink" data-catId="' + idx + '" data-qId="' + i + '">' + caption; 
				}  else { 
					html += ' class="asked">'; 
				}
				html += '</td>';
			}		
			html += '</tr>';
		}

		html += "</table><br>";
        html += "<table><thead><tr>";
        for (idx in d.grouprounds)
        {
            if (getStateValue("gr/"+idx)) { asked = "asked " } else { asked = "" }

            html += "<td class='" + asked + "grLink' id='linkGr' data-grId='" + idx + "'>"
            html += d.grouprounds[idx].title;
            html += "</a></td>";
        }
        html += "</tr></thead></table></div>";

		$(".wrapper").html(html);
		$("td[data-qid]").click(function () { showQuestion($(this).attr("data-catId"), $(this).attr("data-qId")); });
        $("td[data-grId]").click(function () { showGroupround($(this).attr("data-grId")); });
	}

	function showQuestion(cat, q)
	{
		question = d.categories[cat].questions[q].question;
		questionUnblur = d.categories[cat].questions[q].questionUnblur;
			
		$(".wrapper").html(embedFile(question, questionUnblur));
		$("#link").click(function () { showAnswer(cat, q); }); 

        startTimer(90, $("#timer"));
	}

	function showAnswer(cat, q, idx = 0)
	{
		
		answer = d.categories[cat].questions[q].answers[idx];
		$(".wrapper").html(embedFile(answer));
		setStateValue(cat + "/" + q);
		$("#link").click(function () 
		{ 
			if (idx+1 == d.categories[cat].questions[q].answers.length) 
			{ 
				showOverview(); 
			} 
			else 
			{ 
				showAnswer(cat, q, idx + 1); 
			} 
		});
	}

    function showGroupround(id, qIdx = 0, aIdx = -1)
    {
        if (aIdx == -1) {
            file = d.grouprounds[id].questions[qIdx].question;
			unblur = d.grouprounds[id].questions[qIdx].questionUnblur;
        } else {
            file = d.grouprounds[id].questions[qIdx].answers[aIdx];            
			unblur = false;
        }
        $(".wrapper").html(embedFile(file, unblur));
        setStateValue("gr/"+id);

		$("#link").click(function () 
		{ 
            // last question AND last answer
			if (qIdx+1 == d.grouprounds[id].questions.length && 
                aIdx+1 == d.grouprounds[id].questions[qIdx].answers.length ) 
			{ 
				showOverview(); 
			} 
			else 
			{
                // if last answer has been shown, show next question
                if (aIdx+1 == d.grouprounds[id].questions[qIdx].answers.length)
                {
				    showGroupround(id, qIdx + 1); 
                } else {
                    showGroupround(id, qIdx, aIdx + 1);
                }
			} 
		});
        
    }
      
    function embedFile(file, unblur)
    {
        filetype = getFiletype(file)
		if (filetype.startsWith("video/"))
		{
			html = "<a id='link'>";
			html += "<div class='videoContainer'><video autoplay controls><source src='" + file + "' type='" + filetype + "'></video></div>"
		}
		if (filetype.startsWith("image/") && !unblur)
		{
			html = "<a id='link'>";
            // timer only makes sense for static content
			html += "<div id='timer'></div><div class='imageContainer'><img src='" + file + "'></div>"
			html += "</a>";
		}
		if (filetype.startsWith("image/") && unblur)
		{
			html = "<div class='imageContainer'><img onclick='toggleBlur(this);' class='unblur' src='" + file + "'>"
			html += "<div class='linkContainer'><a id='link'>&gt;&gt;</a></div>";
			html += "</div>";
		}
        if (filetype.startsWith("audio/"))
        {
			html = "<a id='link'>";
            html += "<div class='audioContainer'><audio src='" + file + "' autoplay controls></audio></div>"        
			html += "</a>";
        }
        return html;
    }
      
    function startTimer(duration, display) {
        var timer = duration, minutes, seconds;
        var func = function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.text(minutes + ":" + seconds);
            if (--timer < 0) {
                clearInterval(interval);
            }
            
        };
        var interval = setInterval(func, 1000);
        func();
    }      
      
	function getFiletype(filename)
	{
		if (filename.toLowerCase().endsWith('.mp4')) return "video/mp4";
		if (filename.toLowerCase().endsWith('.jpg')) return "image/jpeg";
		if (filename.toLowerCase().endsWith('.png')) return "image/png";
		if (filename.toLowerCase().endsWith('.mp3')) return "audio/mpeg";
	}
