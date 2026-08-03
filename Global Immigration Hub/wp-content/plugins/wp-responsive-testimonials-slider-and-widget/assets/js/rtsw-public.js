jQuery(document).ready(function($) {
	$( '.rtsw-video' ).each(function( index ) {
		var popup_id   = $(this).attr('id');
		var popup_conf = $.parseJSON( $(this).closest('.testimonial-slider-wrp').find('.video-popup-conf').text());
   
    

		if( typeof(popup_id) != 'undefined' ) {
			jQuery('#'+popup_id+ ' .popup-youtube').magnificPopup({		
				type: 'iframe',
				mainClass: 'mfp-fade wp-html5vp-mfp-zoom-in wp-html5vp-popup-main-wrp',
				removalDelay: 160,
				preloader: false,
				fixedContentPos: popup_conf.video_yurl == 'true' ? true : 0,				
			});
			
		}
	});
	
});


