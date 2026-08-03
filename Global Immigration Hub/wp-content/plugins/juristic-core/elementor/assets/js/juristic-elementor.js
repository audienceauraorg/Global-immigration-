/*
Template Name: Juristic
Author: themexshaper
Version: 1.0
*/

(function($){
'use strict';

/*----- ELEMENTOR LOAD FUNTION CALL ---*/

$( window ).on( 'elementor/frontend/init', function() {

	var swiper_slide = function(){
	 
    // HERO SLIDER
    var menu = [];
    $('.swiper-slide').each( function(index){
        menu.push( $(this).find('.slide-inner').attr("data-text") );
    });
    var interleaveOffset = 0.5;
    var swiperOptions = {
        loop: true,
        speed: 1000,
        parallax: true,
        autoplay: {
            delay: 6500,
            disableOnInteraction: false,
        },

        pagination: {
            el: '.swiper-cust-pagination',
                clickable: true,
                renderBullet: function (index, className) {
                    if($(".header-style-1").length) {
                        return '<div class="' + className + '">' + (menu[index]) + '</div>';
                    } else {
                        return '<div class="' + className + '">' + "" + '</div>';
                    }
            },
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        on: {
            progress: function() {
                var swiper = this;
                for (var i = 0; i < swiper.slides.length; i++) {
                    var slideProgress = swiper.slides[i].progress;
                    var innerOffset = swiper.width * interleaveOffset;
                    var innerTranslate = slideProgress * innerOffset;
                    swiper.slides[i].querySelector(".slide-inner").style.transform =
                    "translate3d(" + innerTranslate + "px, 0, 0)";
                }      
            },

            touchStart: function() {
              var swiper = this;
              for (var i = 0; i < swiper.slides.length; i++) {
                swiper.slides[i].style.transition = "";
              }
            },

            setTransition: function(speed) {
                var swiper = this;
                for (var i = 0; i < swiper.slides.length; i++) {
                    swiper.slides[i].style.transition = speed + "ms";
                    swiper.slides[i].querySelector(".slide-inner").style.transition =
                    speed + "ms";
                }
            }
        }
    };

    var swiper = new Swiper(".swiper-container", swiperOptions);

	}; // end

    

    var parallax = function(){
     
        if($("#scene").length) {
            var scene = document.getElementById('scene');
            var parallax = new Parallax(scene);
        }

    }; // end


    var case_study_slider = function(){
     /*------------------------------------------
        = CASE STUDIES SLIDER
    -------------------------------------------*/
    if ($(".case-studies-slider").length) {
        $(".case-studies-slider").owlCarousel({
            autoplay: false,
            smartSpeed: 300,
            margin: 0,
            loop:true,
            autoplayHoverPause:true,
            dots: false,
            responsive: {
                0 : {
                    items: 1
                },

                600 : {
                    items: 2
                },

                768 : {
                    items: 3
                },

                1200 : {
                    items: 4
                },

                1500 : {
                    items: 5
                }
            }
        });
    }


    }; // end


    var gallery_filters = function(){
     
       /*------------------------------------------
        = FUNCTION FORM SORTING GALLERY
        -------------------------------------------*/
        function sortingGallery() {
            if ($(".sortable-gallery .gallery-filters").length) {
                var $container = $('.gallery-container');
                $container.isotope({
                    filter:'*',
                    animationOptions: {
                        duration: 750,
                        easing: 'linear',
                        queue: false,
                    }
                });

                $(".gallery-filters li a").on("click", function() {
                    $('.gallery-filters li .current').removeClass('current');
                    $(this).addClass('current');
                    var selector = $(this).attr('data-filter');
                    $container.isotope({
                        filter:selector,
                        animationOptions: {
                            duration: 750,
                            easing: 'linear',
                            queue: false,
                        }
                    });
                    return false;
                });
            }
        }

        sortingGallery();

    }; // end
    

    var testimonials_slider = function(){
     
        /*------------------------------------------
        = TESTIMONIALS SLIDER
        -------------------------------------------*/
        if ($(".testimonials-slider").length) {
            $(".testimonials-slider").owlCarousel({
                autoplay: false,
                smartSpeed: 300,
                margin: 30,
                loop:true,
                autoplayHoverPause:true,
                responsive: {
                    0 : {
                        items: 1
                    },

                    600 : {
                        items: 2
                    }
                }
            });
        }


    }; // end

    
    var testimonial_slider_s2 = function(){

      /*------------------------------------------
        = TESTIMONIALS SLIDER S2
        -------------------------------------------*/
        if ($(".testimonials-slider-s2").length) {
            $(".testimonials-slider-s2").owlCarousel({
                autoplay: false,
                smartSpeed: 300,
                margin: 60,
                loop:true,
                autoplayHoverPause:true,
                responsive: {
                    0 : {
                        items: 1
                    },

                    600 : {
                        items: 2
                    },

                    992 : {
                        items: 3
                    }
                }
            });
        }


    }; // end

    
    var odometer = function(){

       /*------------------------------------------
        = FUNFACT
        -------------------------------------------*/
        if ($(".odometer").length) {
            $('.odometer').appear();
            $(document.body).on('appear', '.odometer', function(e) {
                var odo = $(".odometer");
                odo.each(function() {
                    var countNumber = $(this).attr("data-count");
                    $(this).html(countNumber);
                });
            });
        }



    }; // end


    var team_slider = function(){

       /*------------------------------------------
        = TEAM SLIDER
        -------------------------------------------*/
        if ($(".team-slider").length) {
            $(".team-slider").owlCarousel({
                autoplay: false,
                smartSpeed: 300,
                margin: 0,
                loop:true,
                autoplayHoverPause:true,
                dots: false,
                nav: true,
                navText: ['<i class="fi flaticon-back"></i>','<i class="fi flaticon-next-1"></i>'],
                responsive: {
                    0 : {
                        items: 1
                    },

                    600 : {
                        items: 2
                    },

                    768 : {
                        items: 3
                    },

                    1200 : {
                        items: 4
                    }
                }
            });
        }



    }; // end


    var partners_slider = function(){

       /*------------------------------------------
        = PARTNERS SLIDER
        -------------------------------------------*/
        if ($(".partners-slider").length) {
            $(".partners-slider").owlCarousel({
                autoplay:true,
                smartSpeed: 300,
                margin: 30,
                loop:true,
                autoplayHoverPause:true,
                dots: false,
                responsive: {
                    0 : {
                        items: 2
                    },

                    550 : {
                        items: 3
                    },

                    992 : {
                        items: 4
                    },

                    1200 : {
                        items: 5
                    }
                }
            });
        }



    }; // end

    var award_slider = function(){

        /*------------------------------------------
            = AWARDS SLIDER
        -------------------------------------------*/
        if ($(".award-slider").length) {
            $(".award-slider").owlCarousel({
                items: 1,
                autoplay:true,
                smartSpeed: 300,
                loop:true,
                autoplayHoverPause:true,
            });
        }


    }; // end


    var progress = function(){

        /*------------------------------------------
        = PROGRESS BAR
        -------------------------------------------*/
        function progressBar() {
            if ($(".progress-bar").length) {
                var $progress_bar = $('.progress-bar');
                $progress_bar.appear();
                $(document.body).on('appear', '.progress-bar', function() {
                    var current_item = $(this);
                    if (!current_item.hasClass('appeared')) {
                        var percent = current_item.data('percent');
                        current_item.css('width', percent + '%').addClass('appeared').parent().append('<span>' + percent + '%' + '</span>');
                    }
                    
                });
            };
        }
         progressBar();
    }; // end

    


	//Slider
	elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_slider.default', function($scope, $){
		swiper_slide();
	} );


    //Hero
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_banner.default', function($scope, $){
        parallax();
    } );


    //case_study_slider
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_project.default', function($scope, $){
        case_study_slider();
    } );


    //team_slider
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_team.default', function($scope, $){
        team_slider();
    } );

    //attorney_slider
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_attorney.default', function($scope, $){
        team_slider();
    } );


    //testimonial
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_testimonial.default', function($scope, $){
        testimonials_slider();
    } );


    //testimonial_slider_s2
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_testimonial.default', function($scope, $){
        testimonial_slider_s2();
    } );


    //odometer
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_funfact.default', function($scope, $){
        odometer();
    } );


    //partners_slider
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_client.default', function($scope, $){
        partners_slider();
    } );


    //award_slider
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_award.default', function($scope, $){
        award_slider();
    } );


    //progress
    elementorFrontend.hooks.addAction( 'frontend/element_ready/tmx-juristic_skill.default', function($scope, $){
        progress();
    } );


    
	
	
} );


})(jQuery);  
