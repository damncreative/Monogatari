import { Component } from '../Component';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

class GameScreen extends Component {

	static setup (selector) {
		$_(selector).append (GameScreen.html ());

		return Promise.resolve ();
	}

	static resize (proportionWidth, proportionHeight) {
		const mainElement = $_('body').get (0);

		const mainWidth = mainElement.offsetWidth;
		const mainHeight = mainElement.offsetHeight;

		const h = Math.floor (mainWidth * (proportionHeight/proportionWidth));
		let widthCss = '100%';
		let heightCss = '100%';
		let marginTopCss = 0;

		if (h <= mainHeight) {
			const marginTop = Math.floor ((mainHeight - h)/2);
			marginTopCss = marginTop + 'px';
			heightCss = h + 'px';

		}
		else {
			const w = Math.floor (mainHeight * (proportionWidth/proportionHeight));
			widthCss = w + 'px';
		}

		$_('.forceAspectRatio').style ({
			width: widthCss,
			height: heightCss,
			marginTop: marginTopCss
		});
	}

	static bind (selector) {
		this.engine.on ('click', '[data-screen="game"] *:not([data-choice])', function () {
			Monogatari.debug.debug ('Next Statement Listener');
			Monogatari.shouldProceed ().then (() => {
				Monogatari.next ();
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
			});
		});

		const forceAspectRatio = Monogatari.setting ('ForceAspectRatio');
		let forceAspectRatioFlag = true;

		switch (forceAspectRatio) {
			case 'Visuals':
				$_('[data-content="visuals"]').addClass('forceAspectRatio');
				break;

			case 'Global':
				$_(Monogatari.selector).addClass('forceAspectRatio');
				break;

			default:
				forceAspectRatioFlag = false;
		}
		
		if (forceAspectRatioFlag) {
			const [w, h] = Monogatari.setting ('AspectRatio').split (':');
			const proportionWidth = parseInt(w);
			const proportionHeight = parseInt(h);
			
			GameScreen.resize(proportionWidth, proportionHeight);
			$_(window).on('resize', () => GameScreen.resize(proportionWidth, proportionHeight));
		}

		Monogatari.registerListener ('back', {
			keys: 'left',
			callback: () => {
				Monogatari.global ('block', false);
				Monogatari.ollback ().then (() => {
					Monogatari.previous ();
				}).catch ((e) => {
					// An action waiting for user interaction or something else
					// is blocking the game.
				});
			}
		});

		return Promise.resolve ();
	}

}

GameScreen._id = 'game-screen';

GameScreen._html = `
	<section data-component="game_screen" data-screen="game" id="game" class="unselectable">
		<div data-content="visuals">
			<div id="particles-js" data-ui="particles"></div>
			<div id="background" data-ui="background"></div>
			<div id='components'></div>
		</div>
		<div data-component="text_box" data-ui="text">
			<img data-ui="face" alt="" data-content="character_expression">
			<span data-ui="who" data-content="character_name"></span>
			<p data-ui="say" data_content="dialog"></p>
		</div>
		<div data-ui="quick-menu" data-component="quick-menu" class="text--right"></div>
	</section>
`;

Monogatari.registerComponent (GameScreen);