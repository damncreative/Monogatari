import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

export class ImageGallery extends Component {

	// We'll set up all needed variables in here
	static setup (selector) {

		// Let's add the gallery component itself to the HTML body
		$_(selector).append (this.html ());

		// Let's add a button to the main menu, we'll use this button to open
		// the gallery.
		$_(`${selector} [data-screen="main"] [data-ui="inner-menu"]`).append ('<button data-action="open-screen" data-open="gallery" data-string="Gallery">Gallery</button>');
		return Promise.resolve ();
	}

	// We'll modify the state of the gallery through this function, which will
	// also save things up to the storage.
	static onStateUpdate () {
		Monogatari.Storage.set ('gallery', ImageGallery.state ());
		return Promise.resolve ();
	}

	static bind (selector) {
		// Now that we added the button, let's add a listener for it so that when
		// players click it, the gallery gets opened.
		$_(`${selector} [data-open="gallery"]`).click (() => {
			// Hide all the other screens
			$_(`${selector} [data-screen]`).hide ();

			// Use the render function to render properly all the images in the gallery
			$_(`${selector} [data-screen="gallery"] [data-ui="gallery"]`).html (this.render ());

			// Now that the images have been added in the render, we can finally
			// show it
			$_(`${selector} [data-screen="gallery"]`).show ();
		});

		// Now lets make it so that when a player clicks on one of the Images
		// of the gallery, the image gets shown. For that purpose, we'll use
		// create a function showImage (). You may notice we are not using a simple
		// $_().click function, instead we are using the 'on' function, this is
		// due to the images being generated automatically, we can't simply
		// attach the listerner to them so we attach it to their parent (the
		// gallery) and then check if the click was actually on an image.
		$_(`${selector} [data-ui="gallery"]`).on ('click', (element) => {
			if (element.target.matches ('[data-image]')) {
				ImageGallery.showImage (element.target.dataset.image);
			}
		});

		// This listener will make it so that any click on the image viewer
		// closes it
		$_(`${selector} [data-ui="image-viewer"]`).click (() => {
			$_(`${selector} [data-screen="gallery"] [data-ui="image-viewer"]`).removeClass ('active');
			$_(`${selector} [data-screen="gallery"] [data-ui="image-viewer"] figure`).style ('background-image', '');
		});
		return Promise.resolve ();
	}

	static init (selector) {
		// Let's check if the storage has the list of unlocked images, if it
		// doesn't exist then let's create an empty one.
		if (Object.keys (ImageGallery.configuration ('images')).length > 0) {
			Monogatari.Storage.get ('gallery').then ((data) => {
				ImageGallery.state ({
					unlocked: data
				});
			}).catch (() => {

			});
		} else {
			// Hide Gallery if there are no images defined.
			$_(`${selector} [data-screen="gallery"]`).remove ();
			$_(`${selector} [data-open="gallery"]`).remove ();
		}

		return Promise.resolve ();
	}

	// A simple function to show an image, this will activate the image viewer
	// and set the image as a background for it.
	static showImage (image) {
		Monogatari.element ().find (`[data-screen="gallery"] [data-ui="image-viewer"] figure`).style ('background-image', `url('./img/gallery/${this.images[image]}')`);
		Monogatari.element ().find (`[data-screen="gallery"] [data-ui="image-viewer"]`).addClass ('active');
	}

	// The render image will build all the image elements we need in the gallery
	static render () {
		// Clear the gallery images so we can rebuild them every time the gallery
		// gets opened
		Monogatari.element ().find (`[data-screen="gallery"] [data-ui="gallery"]`).html ('');
		// Create an image element for evert image declared in the constructor
		return Object.keys (ImageGallery.state ('unlocked')).map ((image) => {
			// Check if the image has been unlocked or not, if it hasn't then a
			// lock will be shown instead of the image.
			if (ImageGallery.state ('unlocked').includes (image)) {
				return `<figure class='md-depth-2 col xs6 s6 m4 l3 xl3' data-image='${image}' style='background-image: url('./img/gallery/${this.images[image]}')'></figure>`;
			} else {
				return '<figure class="md-depth-2 column column--col xs6 s6 m4 l3 xl3"><span class="fa fa-lock"></span></figure>';
			}
		}).join ('');
	}

	static images (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return ImageGallery._configuration.images[object];
			} else {
				ImageGallery._configuration.images = Object.assign ({}, ImageGallery._configuration.images, object);
			}
		} else {
			return ImageGallery._configuration.images;
		}
	}
}

ImageGallery._id = 'gallery-screen';

ImageGallery._configuration = {
	directory: 'gallery',
	images: {}
};

ImageGallery._state = {
	unlocked: []
};

ImageGallery._html = `
	<section data-component="gallery-screen" data-screen="gallery">
		<div class='modal' data-ui="image-viewer">
			<figure></figure>
		</div>
		<button class='fas fa-arrow-left top left' data-action='back'></button>
		<h2 data-string='Gallery'>Gallery</h2>
		<div class='row row--spaced text--center' data-ui="gallery"></div>
	</section>
`;

Monogatari.registerComponent (ImageGallery);