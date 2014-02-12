var fetchedMovies;
var searchResultMovies;
var fetchedReviews;

var currentMovieId;
var currentMovieTitle;
var RottenTomatoesAPIKey = "YourKeyHere";

var queryTypeEnum = {"latestMovie" : 0, "movieReview" : 1, "searchMovies" : 2};
var queryType=0; 


function init_script(){
	GetJSONData("http://api.rottentomatoes.com/api/public/v1.0/lists/movies/in_theaters.json?page_limit=16&page=1&country=us&apikey=" +RottenTomatoesAPIKey);

}

function GetJSONData(url)
{
	var jsonDataSource = {

			URL: url,

			init: function(){
				//URL, success callback, failure callback		
				this.connect(this.URL, this.responseHandler, this.failureHandler);

			},

			/**
			 * Handles the response, and displays device data in web app
			 * @param json
			 */
			responseHandler: function(json) {

				var obj = eval('(' + json + ')');

				if (queryType == queryTypeEnum.latestMovie)
				{
					var movies = obj.movies;
					fetchedMovies = movies;

					var markup = "";

					for(i=0; i < movies.length; i++){			
						markup += this.generateHTMLMarkup(i, movies[i]);		
					}	

					document.getElementById("thumbnailPage").innerHTML = markup;
					mwl.switchClass('#thumbnailPage', 'hide', 'show');
					mwl.switchClass('#loadingPage', 'show', 'hide');
				}
				else if (queryType== queryTypeEnum.movieReview)
				{
					var reviews = obj.reviews;
					fetchedReviews = reviews;
					var markup = "";
					markup = "<h1>" + currentMovieTitle + "</h1><br>";
					markup += "<h2>Reviews</h2><br>" 	
					for(i=0; i < reviews.length; i++){			
						markup += "<b>" + reviews[i]['critic'] + "</b> ("  + reviews[i]['original_score'] +")<br>"
								  +"<i>" + reviews[i]['date']+ "</i><br>" 
								  + reviews[i]['quote']+ "<br><br><hr>";		
					}
					markup += "<input type=\"button\" class=\"ui-button\" value=\"Back to Movie\" onclick=\"mwl.switchClass('#reviewPage', 'show', 'hide');mwl.switchClass('#detailsPage', 'hide', 'show');queryType=0;\"/>"
					
					document.getElementById("reviewPage").innerHTML = markup;
					
					mwl.switchClass('#thumbnailPage', 'show', 'hide');
					mwl.switchClass('#detailsPage', 'show', 'hide');
					mwl.switchClass('#reviewPage', 'hide', 'show');
				}
				else if (queryType== queryTypeEnum.searchMovies)
				{
					var movies = obj.movies;
					searchResultMovies = movies;
					var markup = "";

					for(i=0; i < movies.length; i++){			
						markup += this.generateHTMLMarkup(i, movies[i]);		
					}	

					document.getElementById("searchResults").innerHTML = markup;

					mwl.switchClass('#searchLoadingPage', 'show', 'hide');
					mwl.switchClass('#searchResults', 'hide', 'show');

				}


			},

			/**
			 * Generates HTML markup to be inserted in to Web App DOM.
			 * @index i, index of the device
			 * @param device, device object
			 */
			generateHTMLMarkup: function(i, movie){

			var str ="";

			if (queryType == queryTypeEnum.latestMovie){
				str += "<img width=70px height=100px src=\"" + movie['posters']['thumbnail']+ "\" alt=\""+ movie['id'] +"\" onclick=\"showMovie(alt);\"/>&nbsp;";
			}
			else if (queryType == queryTypeEnum.searchMovies){
				str += "<img width=70px height=100px src=\"" + movie['posters']['thumbnail']+ "\" alt=\""+ movie['id'] +"\" onclick=\"showMovieFromSearch(alt);\"/>&nbsp;";
			}
	
				str +=  "</br>";

				return str;
			},

			failureHandler: function(reason){	
				document.getElementById("thumbnailPage").innerHTML = "Could not get JSON data.<br>"+ reason;
			}, 	


			/**
			 * Retrieves a JSON resource in given URL by using XMLHttpRequest. 
			 * @param url  URL of the JSON resource to retrieve
			 * @param successCb Called, when the JSON resourece is retrieved successfully. Retreived JSON formatted data is passed as argument. 
			 * @param failCb Called, if something goes wrong. Reason in text format, is passed as argument.  
			 */

			connect: function(url, successCb, failCb) {

				var xmlhttp = new XMLHttpRequest();

				xmlhttp.open("GET", url, true);

				xmlhttp.setRequestHeader("Accept","application/json");	
				xmlhttp.setRequestHeader("Cache-Control", "no-cache");
				xmlhttp.setRequestHeader("Pragma", "no-cache");

				var that = this;
				xmlhttp.onreadystatechange= function() {

					if (xmlhttp.readyState ==  4 ){

					if(xmlhttp.status == 200){		
							if (xmlhttp.responseText != null) {
								successCb.call(that, xmlhttp.responseText);
							}else{
								failCb.call(that, "Empty response.");
							}	
						}else{				
							failCb.call(that, "Connection failed: Status "+xmlhttp.status);
						}
					}
				};
				xmlhttp.send();
			}		
	};

	jsonDataSource.init();
}



function showMovie(id) {
	mwl.switchClass('#thumbnailPage', 'show', 'hide');		



	selected_movie = getMovieObject(id);
	var details_page_text = "";

	details_page_text += "<h2>" + selected_movie['title']+ "</h2>";
	details_page_text += "<br/>";
	details_page_text += "<img  src=\""+ selected_movie['posters']['profile']+ "\"/>";
	details_page_text += "<br/><br/>";
	details_page_text +="<b>Release date:</b> " + selected_movie['release_dates']['theater'];
	details_page_text += "<br/>";
	details_page_text += "<br/>";

	var cast = selected_movie['abridged_cast'];
	var cast_string = "";
	for(i=0; i < cast.length; i++){	
		if (i===cast.length-1)
		{
			cast_string += cast[i]['name'];	
		}
		else{
			cast_string += cast[i]['name'] + ",";
		}

	}
	details_page_text += "<b>Cast: </b><br>" + cast_string;
	details_page_text += "<br/>";
	details_page_text += "<br/>";
	details_page_text += "<b>Synopsis: </b><br>" + selected_movie['synopsis'];
	details_page_text += "<br/>";
	
	currentMovieId = selected_movie['id'];
	currentMovieTitle =selected_movie['title']; 

	details_page_text += "<div style=\"text-align:center\"> <input type=\"button\" name=\"reviewButton\" class=\"ui-button\" value=\"Read Reviews\" onclick=\"getMovieReviews();\" />";



	details_page_text += "<input type=\"button\" name=\"backButton\" class=\"ui-button\" value=\"Back\" onclick=\"mwl.switchClass('#thumbnailPage', 'hide', 'show');mwl.switchClass('#detailsPage', 'show', 'hide');\" /> </div>";
	document.getElementById("detailsPage").innerHTML = details_page_text;
	mwl.switchClass('#detailsPage', 'hide', 'show');	



}


function showMovieFromSearch(id) {

	mwl.switchClass('#searchResults', 'show', 'hide');		



	selected_movie = getMovieObject(id);
	var details_page_text = "";

	details_page_text += "<h2>" + selected_movie['title']+ "</h2>";
	details_page_text += "<br/>";
	details_page_text += "<img  src=\""+ selected_movie['posters']['profile']+ "\"/>";
	details_page_text += "<br/><br/>";
	details_page_text +="<b>Release date:</b> " + selected_movie['release_dates']['theater'];
	details_page_text += "<br/>";
	details_page_text += "<br/>";

	var cast = selected_movie['abridged_cast'];
	var cast_string = "";
	for(i=0; i < cast.length; i++){	
		if (i===cast.length-1)
		{
			cast_string += cast[i]['name'];	
		}
		else{
			cast_string += cast[i]['name'] + ",";
		}

	}
	details_page_text += "<b>Cast: </b><br>" + cast_string;
	details_page_text += "<br/>";
	details_page_text += "<br/>";
	details_page_text += "<b>Synopsis: </b><br>" + selected_movie['synopsis'];
	details_page_text += "<br/>";

	details_page_text += "<div style=\"text-align:center\"> <input type=\"button\" name=\"reviewButton\" class=\"ui-button\" value=\"Read Reviews\" />";



	details_page_text += "<input type=\"button\" name=\"backButton\" class=\"ui-button\" value=\"Back\" onclick=\"mwl.switchClass('#searchResults', 'hide', 'show');mwl.switchClass('#searchDetailsPage', 'show', 'hide');\" /> </div>";
	document.getElementById("searchDetailsPage").innerHTML = details_page_text;
	mwl.switchClass('#searchDetailsPage', 'hide', 'show');	

}

function getMovieObject(id) {
	
	var movie_sets;
	if (queryType == queryTypeEnum.latestMovie)
		{
		movie_sets = fetchedMovies;
		}
	else if (queryType == queryTypeEnum.searchMovies)
		{
		movie_sets = searchResultMovies;
		} 
	
	for (var i=0; i<movie_sets.length; i++)
	{
		if (id === movie_sets[i]['id']){

			return movie_sets[i];
		}
	}
	return -1;
}

function searchMovies() {
	mwl.switchClass('#searchLoadingPage', 'hide', 'show');

	queryType =2;
	var search_query = lineEdit.value;
	var url = "http://api.rottentomatoes.com/api/public/v1.0/movies.json?q=" + search_query +
	"&apikey=" +RottenTomatoesAPIKey;
	GetJSONData(url);
}

function getMovieReviews() {
	;
	var url = "http://api.rottentomatoes.com/api/public/v1.0/movies/" + currentMovieId + "/reviews.json?review_type=all&page_limit=20&page=1&country=us"+ "&apikey=" +RottenTomatoesAPIKey;
	queryType =1;
	GetJSONData(url);
}