(function ($) {
	"use strict";

	// Settings

	var twitterWidget = true;					// Set to false to hide widget
	var twitterWidgetID = 'add_your_ID_here';	// ID of your Twitter widget

	var disqusComments = true;					// Set to false to hide comments
	var disqusUser = 'disqus_shortname';		// Set to your own Disqus Shortname

	var weatherWidget = true;					// Set to false to hide widget
	var weaterLocation = 'London, UK';			// Set to your own desired location - Info at: http://simpleweatherjs.com/
	var weatherUnit = 'c';						// Use 'c' for Celsius or 'f' for Fahrenheit


	// WARNING: Do not edit below this point unless
	// you are absolutely sure of what you are doing!




	// Home template setup

	$('.home-template .post:nth-of-type(2), .home-template .post:nth-of-type(3)').removeClass('col-lg-4');

	// Navigation

	$('#mobile-nav-trigger').click(function (el) {
		el.preventDefault();

		if ($(this).hasClass('active')) {
			$(this).removeClass('active');
			$(this).html('Show Navigation');
			$('#nav ul.nav').slideUp('fast').removeClass('active');
		} else {
			$(this).addClass('active');
			$(this).html('Close Navigation');
			$('#nav ul.nav').slideDown('fast').addClass('active');
		}
	});

	$(window).resize(function () {
		$('#mobile-nav-trigger').removeClass('active');
		$('#mobile-nav-trigger').html('Show Navigation');

		if ($('#mobile-nav-trigger').css('display') === 'none') {
			$('#nav ul.nav').show();
		} else {
			$('#nav ul.nav').hide();
		}
	});

	// Disqus comments

	if (disqusComments === true && $('#disqus_thread').length) {
		(function () {
			var dsq = document.createElement('script');
			dsq.type = 'text/javascript';
			dsq.async = true;
			dsq.src = '//' + disqusUser + '.disqus.com/embed.js';
			(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
		})();
	} else {
		$('.post-template .post-comments').remove();
	}

	// Related posts

	$('.related-posts').ghostRelated({
		titleClass: 'h1.post-title',
		tagsClass: '.post-tags'
	});

	// Twitter widget

	if (twitterWidget === true) {
		var twitterConfig = {
			"id": twitterWidgetID,
			"domId": 'widget-tweets',
			"maxTweets": 2,
			"enableLinks": true,
			"showUser": false,
			"showInteraction": false
		};
		twitterFetcher.fetch(twitterConfig);
	} else {
		$('#widget-twitter').remove();
	}

	// Latest posts widget

	function latestPosts() {
		$.get('/rss/', function (data) {
			var $xml = $(data);
			var recent = '';
			$xml.find('item').slice(0, 5).each(function () {
				var $this = $(this),
					item = {
						title: $this.find('title').text(),
						link: $this.find('link').text(),
						description: $this.find('description').text(),
						pubDate: $this.find('pubDate').text(),
						category: $this.find('category').text()
					};
				recent += '<li>';
				recent += '<a title="' + item.title + '" href="' + item.link + '">' + item.title + '</a>';
				recent += '</li>';
			});
			$('#widget-latest ul').html(recent);
		});
	}

	latestPosts();

})(jQuery);