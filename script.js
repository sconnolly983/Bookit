var alarm_status = 'N';	
var alarm;
var scroll_position = 0;
$(document).ready(function() {	
		alarm = window.ad_alarm_group;
		user_id = window.ad_id;
		house_keeping();

	load_bookings();
	
	setInterval(function(){	
		alarm = $("#alarm_group select").val();	
		load_bookings();
	}, 10000);

	$("#nav .booking").click(function(){
			$('#weblog_nav').css('display', 'none');
			$('#booking_nav').slideToggle('slow');
	});
		
	$("#nav .weblog").click(function(){
		//$('#booking_nav').css('display', 'none');					 
		//$('#weblog_nav').slideToggle('slow');
	});
		
	
	$("#editor_close").click(function(){
	     $("#editor_overlay").fadeOut("fast",function(){
			panel_reset();											 											 
		 });	
	});
	
	$("#completion_close").click(function(){
			$("#completion").fadeOut("fast");
			$("#failed").fadeOut("fast");
			$("#successful").fadeOut("fast");
			clear_failure_success();
			panel_reset();
			$("#editor").fadeIn("fast");
			$("#editor_overlay").fadeOut("fast");
	});
	
	$("#booking_complete").click(function(){
		$("#editor").fadeOut("fast",function(){
			$("#completion").fadeIn("fast");
			$("#complete").css("display","block");
			$("#completion_id").val($("#record_id").val());
			
		});
	});	
		
	$("#completion .yes").click(function(){
		$('#complete').fadeOut("fast", function(){
		if((window.ad_user_group != '1') && (window.ad_user_group != '2')){
			$("#successful_initials").val(window.ad_initials);
			$("#successful .initials").css("display","none");
		}else{
			$("#successful .initials").css("display","block");
		}
			$('#successful').fadeIn("fast");
		});
		
	});
	
	$("#completion .no").click(function(){
		$('#complete').fadeOut("fast", function(){
			if((window.ad_user_group != '1') && (window.ad_user_group != '2')){
				$("#failed_initials").val(window.ad_initials);
				$("#failed .initials").css("display","none");
			}else{
				$("#failed .initials").css("display","block");
			}									
												
			$('#failed').fadeIn();
		});
	});
	
	$("#alarm_close").click(function(){
		snooze();	
	});
	
	$("#snooze").click(function(){
		snooze();
	});
	
	$("#successful .complete").click(function(){
		completion_success();
	});
	
	$("#failed .complete").click(function(){
		completion_failed();
	});
	
	$(".attachments_shortcut img").on("mouseenter",function(){  
		var src = "images/paper_clip.png";
		$(this).attr("src",src);
	}).on("mouseleave",function(){  
		var src = "images/paper_clip.png";
		$(this).attr("src",src);
	});
	
	$("#alarm_group select").change(function(){
		alarm = $("#alarm_group select").val();
		if(alarm != 0){
			change_group(alarm);
			load_bookings();
		}
	});
	
});

// Functions
	
	// Loads and draws the bookings for the day
	function load_bookings(){
	var url = "command.php?command=CURRENT_BOOKINGS_LIST&output=json&user_group_id=" + window.alarm;
//$("#echo").append(url);
	$.ajax({
		url: url,
		cache: false,
		success: function(data){
			if(data.error.code != 0){
					alert(data.error.message);	
				}else{
			  var output = "";
				  //populates #bookings_table with summary of each block booking
				  for(var i in data.current_booking){ 
					  if(data.current_booking[i].actioned != ""){
						  var completed = data.current_booking[i].actioned;
							  if(completed == 'Y'){
								 completed = "done";
							  }else if(completed == 'N'){
								  completed = "N";
							  }
					  }else{
						  var completed = ""; 
					  }
										  
					  if(data.current_booking[i].current_status != ""){
						  var status = " status_" + data.current_booking[i].current_status;
					  }else{
						  var status = ""; 
					  }
				
					  output = output + "<tr class='row " + completed + status + " ' id='"+ data.current_booking[i].booking_id +"'>";
					 
					  output = output + "<td class='cell_lineup' onClick='editor(" + data.current_booking[i].booking_id + ");'>";
					  output = output + remove_seconds(data.current_booking[i].lineup);
					  
					  output = output + "</td><td class='cell_start' onClick='editor(" + data.current_booking[i].booking_id + ");'>";
					  output = output + remove_seconds(data.current_booking[i].start);
					  
					  output = output + "</td><td class='cell_duration' onClick='editor(" + data.current_booking[i].booking_id + ");'>";
					  output = output + remove_seconds(data.current_booking[i].duration);
					  // Name
					  output = output + "</td><td class='cell_booking_name' onClick='editor(" + data.current_booking[i].booking_id + ");'>";
					  output = output + data.current_booking[i].booking_name;
					  // Source
					  output = output + "</td><td class='cell_source' onClick='editor(" + data.current_booking[i].booking_id + ");'>";
					  var source = data.current_booking[i].source;
					  if(source == null){
						  source = "";
					  }
					  output = output + source;
					  // Destination
					  output = output + "</td><td class='cell_destination' onClick='editor(" + data.current_booking[i].booking_id + ");'>";
					  var destination = data.current_booking[i].destination;
					  if(destination == null){
						  destination = "";
					  }
					  output = output + destination;
	
					  // Date
					  output = output + "</td><td class='cell_broadcast_date hide'>";
					 
					  var broadcast_date = data.current_booking[i].broadcast_date;
					  
					  output = output + broadcast_date;
					  
					  //alarm id
					  output = output + "</td><td class='alarm_group hide'>";
					  output = output + data.current_booking[i].alarm_group;
					  
					  //attachments
					  output = output + "</td><td  class='attachments_shortcut'>";
					  var attachments = data.current_booking[i].attachments;
					  if(attachments == ''){
						  attachments = "";
					  }else{
						attachments = "<img src='images/paper_clip.png' title='attachment(s) available.' onClick='var a =\"" + attachments + "\"; attachment_shortcut(a)'/>";  
					  }
					  output = output + attachments;
					  
					   //complete_shortcut
					  output = output + "</td><td class='complete_shortcut'>";
					 
					  if("N" == completed){
					     complete_short = "<span title='Complete booking with no comment.' onClick='complete_shortcut(\""+ data.current_booking[i].booking_id +"\")'/></span>";  
						 output = output + complete_short;
					  }
					 
					  //comment_shortcut
					  output = output + "</td><td class='complete_comment'>";
				
					  if(completed == "N"){
						  complete_comment = "<span title='Complete booking and comment on it.' onClick='c_comment(\""+ data.current_booking[i].booking_id +"\")'/></span>";  
						  output = output + complete_comment;
					  }
					  
					  output = output + "</td></tr>";
				}
				
			scroll_position = $('.current_frame').scrollTop();
			 $('#bookings_table tbody').empty(); 	 
			$('#bookings_table tbody').html(output); 
			
			}
				status_update();		
			}
		});
	
	
	var url = "command.php?command=CURRENT_ROUTINE_WORK&output=json&user_group_id=" + window.alarm;
	$.ajax({
		url: url,
		cache: false,
		success: function(data){
			if(data.error.code != 0){
					alert(data.error.message);	
				}else{
			  var output = "";
				  //populates #bookings_table with summary of each block booking
				  for(var i in data.current_routine_work){ 
					  if(data.current_routine_work[i].actioned != ""){
						  var completed = data.current_routine_work[i].actioned;
							  if(completed == 'Y'){
								 completed = "done";
							  }else if(completed == 'N'){
								  completed = "N";
							  }
					  }else{
						  var completed = ""; 
					  }
										  
					  if(data.current_routine_work[i].current_status != ""){
						  var status = " status_" + data.current_routine_work[i].current_status;
					  }else{
						  var status = ""; 
					  }
				
					  output = output + "<tr class='row " + completed + status + " ' id='"+ data.current_routine_work[i].booking_id +"'>";
					 
					  output = output + "<td class='cell_lineup' onClick='editor(" + data.current_routine_work[i].booking_id + ");'>";
					  output = output + remove_seconds(data.current_routine_work[i].start) + " - ";
					  
					  output = output + "</td><td class='cell_start' onClick='editor(" + data.current_routine_work[i].booking_id + ");'>";
					  output = output + remove_seconds(data.current_routine_work[i].duration);
					  // Name
					  output = output + "</td><td class='cell_booking_name' onClick='editor(" + data.current_routine_work[i].booking_id + ");'>";
					  output = output + data.current_routine_work[i].booking_name;
					  // Date
					  output = output + "</td><td class='cell_broadcast_date hide'>";
					 
					  var broadcast_date = data.current_routine_work[i].broadcast_date;
					  
					  output = output + broadcast_date;
					  
					  //alarm id
					  output = output + "</td><td class='alarm_group hide'>";
					  output = output + data.current_routine_work[i].alarm_group;
					  
					  //attachments
					  output = output + "</td><td class='attachments_shortcut'>";
					  var attachments = data.current_routine_work[i].attachments;
					  if(attachments == ''){
						  attachments = "";
					  }else{
						attachments = "<img src='images/paper_clip.png' onClick='var a =\"" + attachments + "\"; attachment_shortcut(a)'/>";  
					  }
					  output = output + attachments;
					  
					   //complete_shortcut
					  output = output + "</td><td class='complete_shortcut'>";
					 
					  if("N" == completed){
					     complete_short = "<span onClick='complete_shortcut(\""+ data.current_routine_work[i].booking_id +"\")'/></span>";  
						 output = output + complete_short;
					  }
					 
					  //comment_shortcut
					  output = output + "</td><td class='complete_comment'>";
				
					  if(completed == "N"){
						  complete_comment = "<span onClick='c_comment(\""+ data.current_routine_work[i].booking_id +"\")'/></span>";  
						  output = output + complete_comment;
					  }
					  
					  output = output + "</td></tr>";
				}
			 $('#routine_work_container').empty(); 	 
			$('#routine_work_container').html(output); 
			}		
			}

		});
	
		var url = "command.php?command=CURRENT_ISSUES_AND_ALERTS&output=json&user_group_id=" + window.alarm;
		$.ajax({
			url: url,
			cache: false,
			success: function(data){
				if(data.error.code != 0){
						alert(data.error.message);	
					}else{
				  var output = "";
					  //populates #bookings_table with summary of each block booking
					  for(var i in data.current_issues_and_alerts){ 
						  if(data.current_issues_and_alerts[i].actioned != ""){
							  var completed = data.current_issues_and_alerts[i].actioned;
								  if(completed == 'Y'){
									 completed = "done";
								  }else if(completed == 'N'){
									  completed = "N";
								  }
						  }else{
							  var completed = ""; 
						  }
											  
						  if(data.current_issues_and_alerts[i].current_status != ""){
							  var status = " status_" + data.current_issues_and_alerts[i].current_status;
						  }else{
							  var status = ""; 
						  }
					
						  output = output + "<tr class='row " + completed + status + " ' id='"+ data.current_issues_and_alerts[i].booking_id +"'>";
						 
						  output = output + "<td class='cell_lineup' onClick='editor(" + data.current_issues_and_alerts[i].booking_id + ");'>";
						  output = output + remove_seconds(data.current_issues_and_alerts[i].start) + " - ";
						  
						  output = output + "</td><td class='cell_start' onClick='editor(" + data.current_issues_and_alerts[i].booking_id + ");'>";
						  output = output + remove_seconds(data.current_issues_and_alerts[i].duration);
						  // Name
						  output = output + "</td><td class='cell_booking_name' onClick='editor(" + data.current_issues_and_alerts[i].booking_id + ");'>";
						  output = output + data.current_issues_and_alerts[i].booking_name;
						  // Date
						  output = output + "</td><td class='cell_broadcast_date hide'>";
						 
						  var broadcast_date = data.current_issues_and_alerts[i].broadcast_date;
						  
						  output = output + broadcast_date;
						  
						  //alarm id
						  output = output + "</td><td class='alarm_group hide'>";
						  output = output + data.current_issues_and_alerts[i].alarm_group;
						  
						  //attachments
						  output = output + "</td><td class='attachments_shortcut'>";
						  var attachments = data.current_issues_and_alerts[i].attachments;
						  if(attachments == ''){
							  attachments = "";
						  }else{
							attachments = "<img src='images/paper_clip.png' onClick='var a =\"" + attachments + "\"; attachment_shortcut(a)'/>";  
						  }
						  output = output + attachments;
						  
						   //complete_shortcut
						  output = output + "</td><td class='complete_shortcut'>";
						 
						  if("N" == completed){
							 complete_short = "<span onClick='complete_shortcut(\""+ data.current_issues_and_alerts[i].booking_id +"\")'/></span>";  
							 output = output + complete_short;
						  }
						 
						  //comment_shortcut
						  output = output + "</td><td class='complete_comment'>";
					
						  if(completed == "N"){
							  complete_comment = "<span onClick='c_comment(\""+ data.current_issues_and_alerts[i].booking_id +"\")'/></span>";  
							  output = output + complete_comment;
						  }
						  
						  output = output + "</td></tr>";
					}
				 $('#issues_and_alerts_container').empty(); 	 
				$('#issues_and_alerts_container').html(output); 
				}		
				}

		});

	
	}
	
	//opens editor and populates the fields
	function editor(id){
		$("#editor select, #editor input").attr('disabled','disabled');
		var id = id;		
		var passed = "command.php?output=json&command=CURRENT_BOOKING_FETCH&booking_id=" + id;
		var lineup;
		var start;
		var finish;
		var option;
		//completion_dropdown();
			$.ajax({
				url: passed,
				cache: false,
				success: function(data){
					if(data.error.code != 0){
						alert("error: " + data.error.code + " " + data.error.message);
					} else { 
						for (var i in data.booking) { // Go through each child node	
							$("#editor #record_id").val(data.booking[i].booking_id);// ID
							$("#editor .booking_name_input").val(data.booking[i].booking_name);// Name
							var broadcast_date = reverse(data.booking[i].broadcast_date);
							$("#editor .broadcast_date_input").val(broadcast_date);// broadcast_date
							var lineup = data.booking[i].lineup;
							$("#editor .lineup_input").val(lineup); // lineup
							var start = data.booking[i].start;				
							$("#editor .start_input").val(start); // start
							$("#editor .finish_input").val(data.booking[i].duration); // finish
							$("#editor .cost_code_input").val(data.booking[i].cost_code); // circuit
							$("#editor .circuit_input").val(data.booking[i].cbis); // circuit	
							$("#editor .notes_textarea").val(data.booking[i].notes); // notes		
							$("#editor .source_input").val(data.booking[i].source); // source
							$("#editor .destination_input").val(data.booking[i].destination); // destination
							$("#editor .confirmed_source_input").val(data.booking[i].confirmed_source); // confirmed_source
							$("#editor .confirmed_destination_input").val(data.booking[i].confirmed_destination); // confirmed_destination
							$("#editor .nou_input").val(data.booking[i].nou); // nou 
							$("#editor .mcr_input").val(data.booking[i].mcr); // mcr 
							$('#set_alarm_select option[value="'+ data.booking[i].alarm_group +'"]').attr('selected', 'selected');		
							
							if(data.booking[i].actioned == "Y"){
								 $("#booking_complete").css("display","none");
							}else{
								 $("#booking_complete").css("display","block");
						    }
							
							var options = data.booking[i].options.split(",");
						
							for (var x in options) {
								dropdown = options[x].split("|");
								$("#editor .dropdown_" + dropdown[1]).val(dropdown[0]);	
							}	
													
							if(data.booking[i].attachments == null){
							
							}else{
							if(data.booking[i].attachments != '' || data.booking[i].attachments != null){
							
							
							if(data.booking[i].attachments != ""){
								var attachments = data.booking[i].attachments.split(",");
								for (var x in attachments){
									attachment = attachments[x].split("|");
									$("#editor .attached_docs ul").append("<li data-id="+attachment[0]+"><div class='title'>"+attachment[1]+"</div><div class='link button_green' onClick='open_attachment($(this).parent().attr(\"data-id\"));'>Open</div><div class='clear'></div></li>");	
								}
							}
							}
						}
					}
					$("#editor_overlay").fadeIn("fast");
					$("#editor").css("display","block");
					
					height = $("#editor").height();
					height = "-" + height/2 + "px";
					$("#editor").css("margin-top",height);
				} 
			}
		});
		
	}

	//clears editor areas
	function panel_reset(){
			$("#new_record_overlay select, #editor select, #completion select").val("0");
			$("#new_record_overlay input[type='text'], #editor input[type='text'], #completion input[type='text']").val("");	
			$("#new_record_overlay textarea, #editor textarea, #completion textarea").text("");
			$(".attached_docs ul").empty();
	}
	
	//clear_failure_success
	function clear_failure_success(){
			$("#successful_initials").val("");
			$("#success_comment_textarea").text("");
			$("#failure_dropdown").val("0");
			$("#success_comment_textarea").text("");
			$("#failed_initials").val("");
			$("#failed .failed_comment_textarea").text("");
	}
	
	//completion_success
	function completion_success(){
	
		var id = $("#completion_id").val();
		var comment = $('#success_comment_textarea').text(); 
		var initials = $('#successful_initials').val();
		var letterNumber = /^[0-9a-zA-Z]+$/;

		if (initials == ""){
			alert("Your initials are required inorder to complete this booking");
			return false;
		}
		
		if (!initials.match(letterNumber)){
			alert("Your initails can't be symbols");
			return false;
		}
			
			
			var passed = "command.php?command=COMPLETION_SUCCESSFUL&output=json&booking_id=" + id + "&comment=" + comment + "&initials=" + initials;
			$.ajax({
				url: passed,
				cache: false,
				success: function() {
					load_bookings();
					panel_reset();
					$("#editor_overlay").fadeOut("fast");
					$('#alarm_overlay').fadeOut("fast");
					$("#completion").fadeOut("fast");
					$("#completion #successful").fadeOut("fast");
					$("#editor").fadeIn("fast");
				} 
			});	
			
		
	}
	
	//completion_no
	function completion_failed(){
	
		var booking_id = $("#record_id").val();
		var comment = $('.failed_comment_textarea').text(); 
		var initials = $('#failed_initials').val();
		var type = "Y";  
		
		//$("#failure_type_select").val();
		var letterNumber = /^[0-9a-zA-Z]+$/;
		if (initials == ""){
			alert("Your initials are required inorder to complete this booking");
			return false;
		}
		
		if (!initials.match(letterNumber)){
			alert("Your initails can't be symbols");
			return false;
		}
				
			var passed = "command.php?command=COMPLETION_FAILURE&output=json&booking_id=" + booking_id + "&comment=" + comment + "&initials=" + initials + "&type=" + type;
			$.ajax({
				url: passed,
				cache: false,
				success: function() {
					load_bookings();
					panel_reset();
				$("#editor_overlay").fadeOut("fast");
				$('#alarm_overlay').fadeOut("fast");
				} 
			});	
			
			$("#completion").fadeOut("fast");
			$("#failed").fadeOut("fast");
			$("#editor").fadeIn("fast");
		
	}

	//status update
	function status_update(){
		var d = new Date();	
		var current = +new Date();
		
			    //current = current.substr(0,-3);
				//alert(current);
				//var current_time = current.parseInt(current);
		
		var count = 0;
		var alarm_count = 0;
		
		$("#bookings_table tbody tr").each(function(){
				var id = $(this).attr('id');
				var line_up = $(this).children(".cell_lineup").text();
				var start =  $(this).children(".cell_start").text();
				
				var base_date = $(this).children(".cell_broadcast_date").text();
				var date_lineup = base_date + ' ' + line_up + ':00';
				var date_start = base_date + ' ' + start+ ':00';
			
			
				  date_lineup = stringToDate(date_lineup);
				  date_start = stringToDate(date_start);
					
				if($(this).hasClass("status_3")){   
					
			    }
			    else if(parseInt(date_lineup) <= parseInt(current) && parseInt(date_start) >= parseInt(current) && $(this).hasClass('status_2') && !$(this).hasClass('done')){
				
			   		if($("#snooze_variable").html() == "on"){		
					}else{
							alarm_count = alarm_count + 1;	
					}
			   }
			   else if(parseInt(date_lineup) <= parseInt(current) && parseInt(date_start) >= parseInt(current) && !$(this).hasClass("status_3") && !$(this).hasClass('status_2')){
					$(this).addClass('status_2').removeClass('status_1');
					$("#snooze_variable").html("");
					update_booking_status(id, 2);
			   }
			   else if(parseInt(date_start) <= parseInt(current) && !$(this).hasClass('status_3')){
					$(this).removeClass('status_2').removeClass('status_1').addClass('status_3');
					update_booking_status(id, 3);
			   }		
			
			});//end of loop
		
		$("#bookings_table tbody tr:not(.status_1)").each(function(){
					count = count + 1;
		});
		
		
		if(scroll_position == 0){
			if(count > 0){
				count = (count - 2)*30;
				$(".current_frame").scrollTop(count);	
			}
		}else{
			$(".current_frame").scrollTop(scroll_position);	
		}
		
		
		if(alarm_count > 0){
			display_alarm(ad_alarm_group);	
		}else{
			$('#alarm_list .container').empty();	
			$('#alarm_overlay').fadeOut();
			audioOff();
		}
		
		
	}
		
	//update booking status
	function update_booking_status(id, status){
						
		 var passed = "command.php?command=UPDATE_BOOKING_STATUS&booking_id=" + id + "&status=" + status;
		 $.ajax({
			url: passed,
			cache: false,
			success: function() {
				//alert("status = " + status);
					if(status == 2){
						//alert(status + " = "+ 2 );
						display_alarm(ad_alarm_group);	
					}
				
				} 
		});
	}
	
	//alert include
	function timer(group){
		var group = group; 
		var url = "alarm.php?alarm_group=" + group;
	  $.ajax({
		url: url,
		cache: false,
		success: function(data) {
			var count_down = $.trim(data);
			count_down = count_down + "000";
		
			getAlarmBookings(group);		
			setTimeout(function(){
				getAlarmBookings(group);		
			},30000);	 	
		} 
	  });
	 
	}
	
	//getAlarmBookings	
	function display_alarm(group){
	
	var url = "command.php?output=json&command=DISPLAY_ALARM&alarm_group=" + group;
		$.ajax({
			url: url,
			cache: false,
					success: function(data){
						if(data.error.code != 0){
							if(data.error.code != 1009){
								alert(data.error.message);	
							}
						}else{
							var output = "";
							for(var i in data.alarm_list){ 
								output = output + "<div class='booking_alert' id='"+ data.alarm_list[i].booking_id +"' onClick='audioOff(); editor(" + data.alarm_list[i].booking_id + ");'>";
								// name
								output = output + "<div class='name'>";
								output = output + (data.alarm_list[i].booking_name);
								// lineup
								output = output + "</div><div class='lineup'>";
								output = output + (data.alarm_list[i].lineup);  
								// Start
								output = output + "</div><div class='start'>";
								output = output + (data.alarm_list[i].start); 
								// Comment
								output = output + "</div><div class='clear'></div></div>";
							}
						
							var existing = $('#alarm_list .container').length;
							if (existing === 1) {
								$('#alarm_list .container').empty();	
								$('#alarm_overlay').fadeIn();	
							}else{
								$('#alarm_list .container').empty();						
							}
							
								$('#alarm_list .container').html(output);						
								height = $("#alarm_container").height();
								height = "-" + height/2 + "px";
								$("#alarm_container").css("margin-top",height);
								
								
								if (!$('#audio_player').length){
									audioOn();
								}
							
							}
					}
		});
	
	}
	
	//snooze
	function snooze(){
		$('#alarm_overlay').fadeOut();	
		audioOff();
		$("#snooze_variable").html("on");		
			setTimeout(function(){
				$("#snooze_variable").html("");	
			},60000);	 	
	}
	
	//completion_dropdown
	function completion_dropdown(){
		$.ajax({
			type: "GET",
			url: "dropdowns.php",
			dataType: "xml",
			success: function(data) {
				$(data).find('failure_type').each(function(){;
					var id = $(this).attr('id');
					var title = $(this).text();
					$("<option value='"+ id +"'>"+title+"</option>").appendTo('#failure_dropdown');
				});
			}
		});
	}
	
	//audio on
	function audioOn(){
		$('#hidden_alarm').html('<audio src="misc/bleep.mp3" preload="auto" loop="loop" autoplay="autoplay" id="audio_player"/>');
		
		  audiojs.events.ready(function() {
   				 var as = audiojs.createAll();
 		  });
		
		$('#hidden_alarm').addClass("hidden");
		alarm_status = 'Y';
	}
	
	//audio off
	function audioOff(){
		$('#hidden_alarm').html("");
		$('#hidden_alarm').removeClass("hidden");
		alarm_status = 'N';
	}
	
	//for converting string to date 
	function parseDate(input) {
	  var parts = input.match(/(\d+)/g);
	  return new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]); // months are 0-based
	}
	
	//house keeping
	function house_keeping(){
		var passed = "command.php?output=json&command=HOUSE_KEEPING";
		$.ajax({
				url: passed,
				cache: false,
				success: function(data){
					if(data.error.code != 0){
						alert("error: " + data.error.code + " " + data.error.message);
					} 										
			}
		});
	}
	
	//reverse the date
	function reverse(date_selected){
		var pieces = date_selected.split('-');
		pieces.reverse();
		date_selected = pieces.join('-');
		return date_selected;
	}
	
	//attachment shortcut
	function attachment_shortcut(ids){
		var attachments = ids.split(",");
		var count = 0;
		for (var x in attachments){
			var attachment = attachments[count];
			open_attachment(attachment);
			count = count + 1;
		}
	}
		
	//complete shortcut
	function complete_shortcut(id){
		if((window.ad_user_group != '1') && (window.ad_user_group != '2')){
			//alert("initials exist user group = " + window.ad_user_group);
			$("#editor").fadeOut("fast");
			var comment = ""; 
			var initials = window.ad_initials;
			var passed = "command.php?command=COMPLETION_SUCCESSFUL&output=json&booking_id=" + id + "&comment=" + comment + "&initials=" + initials;
			
			$.ajax({
				url: passed,
				cache: false,
				success: function() {
					load_bookings();
					panel_reset();
					$("#editor_overlay").fadeOut("fast");
					$('#alarm_overlay').fadeOut("fast");
				} 
			});	
			$("#editor").fadeOut("fast");
			
		}else{
			//alert("fading in");
			$('#editor_overlay').fadeIn("fast");
			$('#editor, #complete, #successful .comment').css("display","none");
			$("#completion, #successful").css("display","block");
			$("#completion_id").val(id);
		}
	};	
	
	//shortcut comment
	function c_comment(id){
		$('#editor_overlay').fadeIn("fast");	
		$('#editor, #complete').css('display','none');	
		$("#completion, #successful, #successful .comment").css('display','block');
		$("#completion_id").val(id);
		if((window.ad_user_group != '1') && (window.ad_user_group != '2')){
			//alert("user has initials and user group is " + window.ad_user_group);
			$("#successful_initials").val(window.ad_initials);
			$("#successful .initials").css("display","none");
		}else{
			$("#successful .initials").css("display","block");
		}
	};	

	//remove seconds
	function remove_seconds(time){
		time = time.substring(0, time.length -3);
		return time;
	}
	function stringToDate(s){
		
		var match = s.match(/^(\d+)-(\d+)-(\d+) (\d+)\:(\d+)\:(\d+)$/);
		var date = new Date(match[1], match[2] - 1, match[3], match[4], match[5], match[6]);
		date = date.getTime() / 1000;
		return date + "000";
		
	}



   function change_group(alarm){
	  
	   var passed = "command.php?command=USER_ALARM_GROUP_UPDATE&output=json&id="+user_id+"&alarm_group_id=" + alarm;
	
			$.ajax({
				url: passed,
				cache: false,
				success: function() {
				} 
			});	
   }