(function($) {

    "use strict";


    
    /*------------------------------------------
        = ALL ESSENTIAL FUNCTIONS
    -------------------------------------------*/

    // Toggle mobile navigation
    function toggleMobileNavigation() {
        var navbar = $(".navigation-holder");
        var openBtn = $(".navbar-header .open-btn");
        var closeBtn = $(".navigation-holder .close-navbar");
        var body = $(".page-wrapper");

        openBtn.on("click", function() {
            if (!navbar.hasClass("slideInn")) {
                navbar.addClass("slideInn");
                body.addClass("body-overlay");
            }
            return false;
        })

        closeBtn.on("click", function() {
            if (navbar.hasClass("slideInn")) {
                navbar.removeClass("slideInn");
            }
            body.removeClass("body-overlay");
            return false;
        })
    }

    toggleMobileNavigation();


    // Function for toggle class for small menu
    function toggleClassForSmallNav() {
        var windowWidth = window.innerWidth;
        var mainNav = $("#navbar > ul");

        if (windowWidth <= 991) {
            mainNav.addClass("small-nav");
        } else {
            mainNav.removeClass("small-nav");
        }
    }

    toggleClassForSmallNav();


    // Function for small menu
    function smallNavFunctionality() {
        var windowWidth = window.innerWidth;
        var mainNav = $(".navigation-holder");
        var smallNav = $(".navigation-holder > .small-nav");
        var subMenu = smallNav.find(".sub-menu");
        var megamenu = smallNav.find(".mega-menu");
        var menuItemWidthSubMenu = smallNav.find(".menu-item-has-children > a");

        if (windowWidth <= 991) {
            subMenu.hide();
            megamenu.hide();
            menuItemWidthSubMenu.on("click", function(e) {
                var $this = $(this);
                $this.siblings().slideToggle();
                 e.preventDefault();
                e.stopImmediatePropagation();
            })
        } else if (windowWidth > 991) {
            mainNav.find(".sub-menu").show();
            mainNav.find(".mega-menu").show();
        }
    }

    smallNavFunctionality();


    // Parallax background
    function bgParallax() {
        if ($(".parallax").length) {
            $(".parallax").each(function() {
                var height = $(this).position().top;
                var resize     = height - $(window).scrollTop();
                var doParallax = -(resize/5);
                var positionValue   = doParallax + "px";
                var img = $(this).data("bg-image");

                $(this).css({
                    backgroundImage: "url(" + img + ")",
                    backgroundPosition: "50%" + positionValue,
                    backgroundSize: "cover"
                });
            });
        }
    }


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

    // SLIDER BACKGROUND IMAGE
    var sliderBgSetting = $(".slide-bg-image");
    sliderBgSetting.each(function(indx){
        if ($(this).attr("data-background")){
            $(this).css("background-image", "url(" + $(this).data("background") + ")");
        }
    });




    /*------------------------------------------
        = HIDE PRELOADER
    -------------------------------------------*/
    function preloader() {
        if($('.preloader').length) {
            $('.preloader').delay(100).fadeOut(500, function() {

                //active wow
                wow.init();

            });
        }
    }


    /*------------------------------------------
        = WOW ANIMATION SETTING
    -------------------------------------------*/
    var wow = new WOW({
        boxClass:     'wow',      // default
        animateClass: 'animated', // default
        offset:       0,          // default
        mobile:       true,       // default
        live:         true        // default
    });


    /*------------------------------------------
        = ACTIVE POPUP IMAGE
    -------------------------------------------*/
    if ($(".fancybox").length) {
        $(".fancybox").fancybox({
            openEffect  : "elastic",
            closeEffect : "elastic",
            wrapCSS     : "project-fancybox-title-style"
        });
    }


    /*------------------------------------------
        = POPUP VIDEO
    -------------------------------------------*/
    if ($(".video-btn").length) {
        $(".video-btn").on("click", function(){
            $.fancybox({
                href: this.href,
                type: $(this).data("type"),
                'title'         : this.title,
                helpers     : {
                    title : { type : 'inside' },
                    media : {}
                },

                beforeShow : function(){
                    $(".fancybox-wrap").addClass("gallery-fancybox");
                }
            });
            return false
        });
    }


    /*------------------------------------------
        = ACTIVE GALLERY POPUP IMAGE
    -------------------------------------------*/
    if ($(".popup-gallery").length) {
        $('.popup-gallery').magnificPopup({
            delegate: 'a',
            type: 'image',

            gallery: {
              enabled: true
            },

            zoom: {
                enabled: true,

                duration: 300,
                easing: 'ease-in-out',
                opener: function(openerElement) {
                    return openerElement.is('img') ? openerElement : openerElement.find('img');
                }
            }
        });
    }


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


    /*------------------------------------------
        = MASONRY GALLERY SETTING
    -------------------------------------------*/
    function masonryGridSetting() {
        if ($('.masonry-gallery').length) {
            var $grid =  $('.masonry-gallery').masonry({
                itemSelector: '.grid-item',
                columnWidth: '.grid-item',
                percentPosition: true
            });

            $grid.imagesLoaded().progress( function() {
                $grid.masonry('layout');
            });
        }
    }

    // masonryGridSetting();


    /*------------------------------------------
        = STICKY HEADER
    -------------------------------------------*/
    // Function for clone an element for sticky menu
    function cloneNavForSticyMenu($ele, $newElmClass) {
        $ele.addClass('original').clone().insertAfter($ele).addClass($newElmClass).removeClass('original');
    }

    // clone home style 1 navigation for sticky menu
    if ($('.site-header .navigation.sticky-menu-on').length) {
        cloneNavForSticyMenu($('.site-header .navigation.sticky-menu-on'), "sticky-header");
    }

    var lastScrollTop = '';

    function stickyMenu($targetMenu, $toggleClass) {
        var st = $(window).scrollTop();
        var mainMenuTop = $('.site-header .navigation.sticky-menu-on');

        if ($(window).scrollTop() > 1000) {
            if (st > lastScrollTop) {
                // hide sticky menu on scroll down
                $targetMenu.removeClass($toggleClass);

            } else {
                // active sticky menu on scroll up
                $targetMenu.addClass($toggleClass);
            }

        } else {
            $targetMenu.removeClass($toggleClass);
        }

        lastScrollTop = st;
    }


    /*------------------------------------------
        = Header search toggle
    -------------------------------------------*/
    if($(".header-search-form-wrapper").length) {
        var searchToggleBtn = $(".search-toggle-btn");
        var searchToggleBtnIcon = $(".search-toggle-btn i");
        var searchContent = $(".header-search-form");
        var body = $("body");

        searchToggleBtn.on("click", function(e) {
            searchContent.toggleClass("header-search-content-toggle");
            searchToggleBtnIcon.toggleClass("fi flaticon-magnifying-glass ti-close");
            e.stopPropagation();
        });

        body.on("click", function() {
            searchContent.removeClass("header-search-content-toggle");
        }).find(searchContent).on("click", function(e) {
            e.stopPropagation();
        });
    }


    
    /*------------------------------------------
        = Header shopping cart toggle
    -------------------------------------------*/

    $('.cart-toggle-btn').on('click', function(event) {
        event.preventDefault();
         if($(".mini-cart").length) {
            var cartToggleBtn = $(".cart-toggle-btn");
            var cartContent = $(".mini-cart-content");
            var body = $("body");

            cartContent.toggleClass("mini-cart-content-toggle");
            event.stopPropagation();

            body.on("click", function() {
                cartContent.removeClass("mini-cart-content-toggle");
            }).find(cartContent).on("click", function(e) {
                e.stopPropagation();
            });
         }
    });


    // set two coloumn height equial
    function setTwoColEqHeight($col1, $col2) {
        var firstCol = $col1,
            secondCol = $col2,
            firstColHeight = $col1.innerHeight(),
            secondColHeight = $col2.innerHeight();

        if (firstColHeight > secondColHeight) {
            secondCol.css({
                "height": firstColHeight + (-1) + "px"
            })
        } else {
            firstCol.css({
                "height": secondColHeight + (-1) + "px"
            })
        }
    }


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


    /*------------------------------------------
        = POST SLIDER
    -------------------------------------------*/
    if($(".post-slider".length)) {
        $(".post-slider").owlCarousel({
            mouseDrag: false,
            smartSpeed: 500,
            margin: 30,
            loop:true,
            nav: true,
            navText: ['<i class="fi flaticon-back"></i>','<i class="fi flaticon-next"></i>'],
            dots: false,
            items: 1
        });
    }  


    /*------------------------------------------
        = SHOP DETAILS PAGE PRODUCT SLIDER
    -------------------------------------------*/
    if ($(".shop-single-slider").length) {
        $('.slider-for').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            arrows: false,
            fade: true,
            asNavFor: '.slider-nav'
        });
        $('.slider-nav').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            asNavFor: '.slider-for',
            focusOnSelect: true,
            prevArrow: '<i class="nav-btn nav-btn-lt ti-arrow-left"></i>',
            nextArrow: '<i class="nav-btn nav-btn-rt ti-arrow-right"></i>',

            responsive: [
                {
                    breakpoint: 500,
                    settings: {
                    slidesToShow: 3,
                        infinite: true
                    }
                },
                {
                    breakpoint: 400,
                    settings: {
                        slidesToShow: 2
                    }
                }
            ]

        });
    }


    /*------------------------------------------
        = TOUCHSPIN FOR PRODUCT SINGLE PAGE
    -------------------------------------------*/
    if ($("input[name='product-count']").length) {
        $("input[name='product-count']").TouchSpin({
            verticalbuttons: true
        });
    }
    

    /*------------------------------------------
        = BACK TO TOP BTN SETTING
    -------------------------------------------*/
    $("body").append("<a href='#' class='back-to-top'><i class='ti-arrow-circle-up'></i></a>");

    function toggleBackToTopBtn() {
        var amountScrolled = 1000;
        if ($(window).scrollTop() > amountScrolled) {
            $("a.back-to-top").fadeIn("slow");
        } else {
            $("a.back-to-top").fadeOut("slow");
        }
    }

    $(".back-to-top").on("click", function() {
        $("html,body").animate({
            scrollTop: 0
        }, 700);
        return false;
    })


    /*------------------------------------------
        = CONTACT FORM SUBMISSION
    -------------------------------------------*/
    if ($("#contact-form-main").length) {
        $("#contact-form-main").validate({
            rules: {
                name: {
                    required: true,
                    minlength: 2
                },

                email: "required",

                phone: "required",
                
                subject: {
                    required: true
                }


            },

            messages: {
                name: "Please enter your name",
                email: "Please enter your email address",
                phone: "Please enter your phone number",
                subject: "Please select your contact subject"
            },

            submitHandler: function (form) {
                $.ajax({
                    type: "POST",
                    url: "mail-contact.php",
                    data: $(form).serialize(),
                    success: function () {
                        $( "#loader").hide();
                        $( "#success").slideDown( "slow" );
                        setTimeout(function() {
                        $( "#success").slideUp( "slow" );
                        }, 3000);
                        form.reset();
                    },
                    error: function() {
                        $( "#loader").hide();
                        $( "#error").slideDown( "slow" );
                        setTimeout(function() {
                        $( "#error").slideUp( "slow" );
                        }, 3000);
                    }
                });
                return false; // required to block normal submit since you used ajax
            }

        });
    }



    /*==========================================================================
        WHEN DOCUMENT LOADING
    ==========================================================================*/
        $(window).on('load', function() {

            preloader();

            toggleMobileNavigation();

            smallNavFunctionality();

            //set the couple section groom bride two col equal height
            if($(".service-section").length) {
                setTwoColEqHeight($(".service-section .left-col"), $(".service-section .right-col"));
            }

        });



    /*==========================================================================
        WHEN WINDOW SCROLL
    ==========================================================================*/
    $(window).on("scroll", function() {

        if ($(".site-header").length) {
            stickyMenu( $('.site-header .navigation.sticky-menu-on'), "sticky-on" );
        }

        toggleBackToTopBtn();
        
    });


    /*==========================================================================
        WHEN WINDOW RESIZE
    ==========================================================================*/
    $(window).on("resize", function() {
        
        toggleClassForSmallNav();

        clearTimeout($.data(this, 'resizeTimer'));
        $.data(this, 'resizeTimer', setTimeout(function() {
            smallNavFunctionality();
        }, 200));

        //set the couple section groom bride two col equal height
        if($(".service-section").length) {
            setTwoColEqHeight($(".service-section .left-col"), $(".service-section .right-col"));
        }
    });

    $(document).ready(function(){
      $('div.quantity.buttons_added .plus, td.quantity.buttons_added .plus').attr("value", $.parseHTML("&#xe113;")[0].data);
      $('div.quantity.buttons_added .minus, td.quantity.buttons_added .minus').attr("value", $.parseHTML("&#xe114;")[0].data);
    });

    $('.woocommerce .thumbnails .owl-nav .owl-prev i').addClass('ti-arrow-left');
    $('.woocommerce .woocommerce-product-search button').addClass('ti-search');

})(window.jQuery);

/* ── Floating Messenger button with popup ── */
(function() {
  var MESSENGER_URL = 'https://m.me/327884021233501';
  var INQUIRY_OPTIONS = [
    'Study Permit / Study Visa',
    'Work Permit',
    'Express Entry / PR Application',
    'Spousal & Family Sponsorship',
    'Visitor Visa / TRV',
    'SINP / Provincial Nominee Program',
    'General Inquiry'
  ];

  var style = document.createElement('style');
  style.textContent = [
    '.gih-mb{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#0084ff,#00c6ff);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,132,255,0.45);border:none;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;}',
    '.gih-mb:hover{transform:scale(1.1);box-shadow:0 6px 22px rgba(0,132,255,0.55);}',
    '.gih-mb svg{display:block;fill:#fff;}',
    '.gih-mp{position:fixed;bottom:92px;right:16px;z-index:9998;width:300px;background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18),0 2px 8px rgba(0,132,255,0.10);overflow:hidden;font-family:Poppins,system-ui,sans-serif;display:none;}',
    '.gih-mp.open{display:block;}',
    '.gih-mh{background:linear-gradient(135deg,#0084ff,#00c6ff);padding:14px 16px 12px;display:flex;justify-content:space-between;align-items:flex-start;}',
    '.gih-mt{color:#fff;font-weight:700;font-size:15px;line-height:1.3;}',
    '.gih-ms{color:rgba(255,255,255,0.85);font-size:12px;margin-top:3px;}',
    '.gih-mc{background:none;border:none;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:0 0 0 10px;opacity:0.85;}',
    '.gih-mbody{padding:16px;}',
    '.gih-lbl{display:block;font-size:12px;font-weight:600;color:#555;margin-bottom:5px;}',
    '.gih-inp,.gih-sel{width:100%;box-sizing:border-box;padding:9px 12px;border-radius:8px;border:1.5px solid #e0e0e0;font-size:13px;background:#fafafa;color:#222;outline:none;font-family:inherit;margin-bottom:12px;}',
    '.gih-sel{cursor:pointer;}',
    '.gih-sub{width:100%;padding:11px;background:linear-gradient(135deg,#0084ff,#00c6ff);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:0.02em;}'
  ].join('');
  document.head.appendChild(style);

  /* Popup */
  var popup = document.createElement('div');
  popup.className = 'gih-mp';
  popup.innerHTML =
    '<div class="gih-mh">' +
      '<div><div class="gih-mt">Chat with Us</div><div class="gih-ms">We typically reply within minutes</div></div>' +
      '<button class="gih-mc" aria-label="Close">\u00d7</button>' +
    '</div>' +
    '<div class="gih-mbody">' +
      '<form>' +
        '<label class="gih-lbl">Your Name <span style="color:#aaa;font-weight:400;">(optional)</span></label>' +
        '<input class="gih-inp" type="text" placeholder="e.g. Maria" maxlength="60" />' +
        '<label class="gih-lbl">I\'m inquiring about\u2026 <span style="color:#d33;font-size:11px;">*</span></label>' +
        '<select class="gih-sel" required>' +
          '<option value="" disabled selected>Select a topic\u2026</option>' +
          INQUIRY_OPTIONS.map(function(o){ return '<option value="' + o + '">' + o + '</option>'; }).join('') +
        '</select>' +
        '<button type="submit" class="gih-sub">Chat on Messenger</button>' +
      '</form>' +
    '</div>';
  document.body.appendChild(popup);

  /* Button */
  var messengerSVG = '<svg viewBox="0 0 24 24" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.906 1.377 5.504 3.538 7.24V22l3.332-1.83c.89.246 1.833.378 2.13.378 5.522 0 10-4.144 10-9.305C21 6.145 17.523 2 12 2zm1.008 12.535-2.548-2.718-4.976 2.718 5.474-5.813 2.612 2.718 4.91-2.718-5.472 5.813z"/></svg>';
  var closeSVG     = '<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

  var btn = document.createElement('button');
  btn.className = 'gih-mb';
  btn.setAttribute('aria-label', 'Chat with us on Messenger');
  btn.innerHTML = messengerSVG;
  document.body.appendChild(btn);

  /* Logic */
  var isOpen = false;
  var form    = popup.querySelector('form');
  var closeBtn = popup.querySelector('.gih-mc');

  function openPopup()  { isOpen = true;  popup.classList.add('open');    btn.innerHTML = closeSVG;      btn.setAttribute('aria-label','Close'); }
  function closePopup() { isOpen = false; popup.classList.remove('open'); btn.innerHTML = messengerSVG; btn.setAttribute('aria-label','Chat with us on Messenger'); }

  btn.addEventListener('click', function() { if (isOpen) closePopup(); else openPopup(); });
  closeBtn.addEventListener('click', closePopup);

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    window.open(MESSENGER_URL, '_blank', 'noopener,noreferrer');
    form.reset();
    closePopup();
  });
})();

/* ── Site Entry Popup ── */
(function() {
  var SESSION_KEY = 'gih_entry_popup_shown';
  if (sessionStorage.getItem(SESSION_KEY)) return;

  var INQUIRY_OPTIONS = [
    'Study Permit / Study Visa',
    'Work Permit',
    'Express Entry / PR Application',
    'Spousal & Family Sponsorship',
    'Visitor Visa / TRV',
    'SINP / Provincial Nominee Program',
    'General Inquiry'
  ];

  /* API endpoint — same origin as the Next.js app */
  var API_URL = 'https://immigrationdepot.online/api/inquiry';

  var style = document.createElement('style');
  style.textContent = [
    '.gih-ep-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Poppins,system-ui,sans-serif;}',
    '.gih-ep-card{width:100%;max-width:440px;background:#fff;border-radius:20px;box-shadow:0 24px 64px rgba(0,0,0,0.25);overflow:hidden;}',
    '.gih-ep-head{background:linear-gradient(135deg,#0B1C3A,#163060);padding:24px 24px 20px;position:relative;}',
    '.gih-ep-close{position:absolute;top:12px;right:16px;background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.7);font-size:26px;line-height:1;}',
    '.gih-ep-badge{display:inline-block;background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.4);border-radius:20px;padding:4px 12px;font-size:12px;color:#C9A84C;font-weight:600;margin-bottom:10px;letter-spacing:0.04em;}',
    '.gih-ep-title{color:#fff;margin:0 0 6px;font-size:22px;font-weight:700;line-height:1.2;}',
    '.gih-ep-sub{color:rgba(255,255,255,0.75);margin:0;font-size:14px;}',
    '.gih-ep-body{padding:24px;}',
    '.gih-ep-lbl{display:block;font-size:12px;font-weight:600;color:#444;margin-bottom:5px;}',
    '.gih-ep-inp,.gih-ep-sel{width:100%;box-sizing:border-box;padding:10px 14px;border-radius:10px;border:1.5px solid #e0e0e0;font-size:14px;background:#fafafa;color:#222;outline:none;font-family:inherit;margin-bottom:14px;}',
    '.gih-ep-sel{cursor:pointer;}',
    '.gih-ep-btn{width:100%;padding:13px;background:linear-gradient(135deg,#C9A84C,#e0ba5c);color:#0B1C3A;border:none;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;letter-spacing:0.02em;}',
    '.gih-ep-btn:disabled{background:#ccc;cursor:not-allowed;}',
    '.gih-ep-hint{font-size:11px;color:#aaa;text-align:center;margin:10px 0 0;}',
    '.gih-ep-success{text-align:center;padding:12px 0 8px;}',
    '.gih-ep-icon{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#C9A84C,#e0ba5c);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}',
    '.gih-ep-icon svg{width:28px;height:28px;fill:#0B1C3A;}',
    '.gih-ep-stitle{color:#0B1C3A;font-size:18px;font-weight:700;margin:0 0 8px;}',
    '.gih-ep-stext{color:#666;font-size:14px;margin:0;line-height:1.5;}'
  ].join('');
  document.head.appendChild(style);

  /* Build markup */
  var overlay = document.createElement('div');
  overlay.className = 'gih-ep-overlay';
  overlay.innerHTML =
    '<div class="gih-ep-card">' +
      '<div class="gih-ep-head">' +
        '<button class="gih-ep-close" aria-label="Close">\u00d7</button>' +
        '<div class="gih-ep-badge">FREE CONSULTATION</div>' +
        '<h2 class="gih-ep-title">Start Your Canada Immigration Journey</h2>' +
        '<p class="gih-ep-sub">Tell us about your goals &mdash; we\'ll reach out to guide you.</p>' +
      '</div>' +
      '<div class="gih-ep-body">' +
        '<form class="gih-ep-form">' +
          '<label class="gih-ep-lbl">Full Name <span style="color:#d33">*</span></label>' +
          '<input class="gih-ep-inp" type="text" name="name" placeholder="e.g. Maria Santos" maxlength="80" required />' +
          '<label class="gih-ep-lbl">Email Address <span style="color:#d33">*</span></label>' +
          '<input class="gih-ep-inp" type="email" name="email" placeholder="e.g. maria@email.com" required />' +
          '<label class="gih-ep-lbl">Phone <span style="color:#aaa;font-weight:400;">(optional)</span></label>' +
          '<input class="gih-ep-inp" type="tel" name="phone" placeholder="e.g. +1 306 123 4567" maxlength="30" />' +
          '<label class="gih-ep-lbl">I\'m interested in <span style="color:#d33">*</span></label>' +
          '<select class="gih-ep-sel" name="inquiry" required>' +
            '<option value="" disabled selected>Select a program\u2026</option>' +
            INQUIRY_OPTIONS.map(function(o){ return '<option value="' + o + '">' + o + '</option>'; }).join('') +
          '</select>' +
          '<button type="submit" class="gih-ep-btn">Get Free Consultation</button>' +
          '<p class="gih-ep-hint">No commitment. We\'ll contact you within 24 hours.</p>' +
        '</form>' +
        '<div class="gih-ep-success" style="display:none;">' +
          '<div class="gih-ep-icon"><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' +
          '<h3 class="gih-ep-stitle">Thank You!</h3>' +
          '<p class="gih-ep-stext">We\'ve received your inquiry.<br/>Our team will reach out to you shortly.</p>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);

  var card    = overlay.querySelector('.gih-ep-card');
  var form    = overlay.querySelector('.gih-ep-form');
  var success = overlay.querySelector('.gih-ep-success');
  var closeBtn = overlay.querySelector('.gih-ep-close');
  var submitBtn = overlay.querySelector('.gih-ep-btn');

  function dismiss() {
    sessionStorage.setItem(SESSION_KEY, '1');
    overlay.style.display = 'none';
  }

  overlay.addEventListener('click', dismiss);
  card.addEventListener('click', function(e) { e.stopPropagation(); });
  closeBtn.addEventListener('click', dismiss);

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending\u2026';

    var data = {
      name:    form.querySelector('[name="name"]').value,
      email:   form.querySelector('[name="email"]').value,
      phone:   form.querySelector('[name="phone"]').value,
      inquiry: form.querySelector('[name="inquiry"]').value
    };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(function(){}).finally(function() {
      sessionStorage.setItem(SESSION_KEY, '1');
      form.style.display = 'none';
      success.style.display = 'block';
      setTimeout(dismiss, 3000);
    });
  });

  /* Show after 4 seconds */
  setTimeout(function() { overlay.style.display = 'flex'; }, 4000);
  overlay.style.display = 'none'; /* hidden until timer fires */
})();

