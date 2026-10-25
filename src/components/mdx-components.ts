import './mdx/components.css.ts';
// blocks.css.ts 必须排在 components.css.ts 之后：容器 `> *` 与 callout 同为 (0,2,0) 特异性，靠源序决胜
import './mdx/blocks.css.ts';
import './mdx/diagram.css.ts';

import Audio from './mdx/Audio.astro';
import Blockquote from './mdx/Blockquote.astro';
import Blur from './mdx/Blur.astro';
import Callout from './mdx/Callout.astro';
import Card from './mdx/Card.astro';
import Diagram from './mdx/Diagram.astro';
import Caption from './mdx/Caption.astro';
import Flow from './mdx/Flow.astro';
import FlowStep from './mdx/FlowStep.astro';
import Fold from './mdx/Fold.astro';
import Folder from './mdx/Folder.astro';
import Folders from './mdx/Folders.astro';
import Formula from './mdx/Formula.astro';
import Figure from './mdx/Figure.astro';
import Intro from './mdx/Intro.astro';
import Label from './mdx/Label.astro';
import Note from './mdx/Note.astro';
import Pane from './mdx/Pane.astro';
import Panes from './mdx/Panes.astro';
import Ref from './mdx/Ref.astro';
import Refs from './mdx/Refs.astro';
import Subhead from './mdx/Subhead.astro';
import Table from './mdx/Table.astro';
import Tile from './mdx/Tile.astro';
import Button from './mdx/Button.astro';
import Banner from './mdx/Banner.astro';
import Checkbox from './mdx/Checkbox.astro';
import Copy from './mdx/Copy.astro';
import Deleted from './mdx/Deleted.astro';
import Emoji from './mdx/Emoji.astro';
import Emphasis from './mdx/Emphasis.astro';
import Frame from './mdx/Frame.astro';
import Gallery from './mdx/Gallery.astro';
import GalleryImage from './mdx/GalleryImage.astro';
import GhCard from './mdx/GhCard.astro';
import Grid from './mdx/Grid.astro';
import Hashtag from './mdx/Hashtag.astro';
import ImageCard from './mdx/ImageCard.astro';
import Kbd from './mdx/Kbd.astro';
import LinkCard from './mdx/LinkCard.astro';
import Mark from './mdx/Mark.astro';
import Panel from './mdx/Panel.astro';
import PanelSegment from './mdx/PanelSegment.astro';
import Paper from './mdx/Paper.astro';
import PaperLine from './mdx/PaperLine.astro';
import PaperSection from './mdx/PaperSection.astro';
import Password from './mdx/Password.astro';
import Photo from './mdx/Photo.astro';
import Poster from './mdx/Poster.astro';
import Posters from './mdx/Posters.astro';
import Poetry from './mdx/Poetry.astro';
import Private from './mdx/Private.astro';
import Quot from './mdx/Quot.astro';
import Radio from './mdx/Radio.astro';
import Rating from './mdx/Rating.astro';
import Reel from './mdx/Reel.astro';
import SiteCard from './mdx/SiteCard.astro';
import Sites from './mdx/Sites.astro';
import Step from './mdx/Step.astro';
import Sub from './mdx/Sub.astro';
import Sup from './mdx/Sup.astro';
import Tab from './mdx/Tab.astro';
import Tabs from './mdx/Tabs.astro';
import Terminal from './mdx/Terminal.astro';
import Timeline from './mdx/Timeline.astro';
import TimeNode from './mdx/TimeNode.astro';
import Title from './mdx/Title.astro';
import Underline from './mdx/Underline.astro';
import Wavy from './mdx/Wavy.astro';
import YoCard from './mdx/YoCard.astro';

export {
	Audio,
	Banner,
	Blockquote,
	Blur,
	Button,
	Callout,
	Card,
	Caption,
	Checkbox,
	Copy,
	Deleted,
	Deleted as Del,
	Diagram,
	Emoji,
	Emphasis,
	Emphasis as Emp,
	Flow,
	FlowStep,
	Fold,
	Folder,
	Folders,
	Formula,
	Figure,
	Frame,
	Gallery,
	GalleryImage,
	GhCard,
	Grid,
	Hashtag,
	ImageCard,
	Intro,
	Kbd,
	Label,
	LinkCard,
	Mark,
	Note,
	Panel,
	PanelSegment,
	Pane,
	Panes,
	Paper,
	PaperLine,
	PaperSection,
	Password,
	Password as Psw,
	Photo,
	Poster,
	Posters,
	Poetry,
	Private,
	Quot,
	Radio,
	Rating,
	Ref,
	Refs,
	Reel,
	SiteCard,
	Sites,
	Step,
	Sub,
	Subhead,
	Sup,
	Tab,
	Table,
	Tabs,
	Terminal,
	Tile,
	Timeline,
	TimeNode,
	Title,
	Underline,
	Wavy,
	YoCard,
};

export const mdxComponents = {
	Audio,
	Banner,
	Blockquote,
	Blur,
	Button,
	Callout,
	Card,
	Caption,
	Checkbox,
	Copy,
	Deleted,
	Del: Deleted,
	Diagram,
	Emoji,
	Emphasis,
	Emp: Emphasis,
	Flow,
	FlowStep,
	Fold,
	Folder,
	Folders,
	Formula,
	Figure,
	Frame,
	Gallery,
	GalleryImage,
	GhCard,
	Grid,
	Hashtag,
	ImageCard,
	Intro,
	Kbd,
	Label,
	LinkCard,
	Mark,
	Note,
	Panel,
	PanelSegment,
	Pane,
	Panes,
	Paper,
	PaperLine,
	PaperSection,
	Password,
	Psw: Password,
	Photo,
	Poster,
	Posters,
	Poetry,
	Private,
	Quot,
	Radio,
	Rating,
	Ref,
	Refs,
	Reel,
	SiteCard,
	Sites,
	Step,
	Sub,
	Subhead,
	Sup,
	Tab,
	Table,
	Tabs,
	Terminal,
	Tile,
	Timeline,
	TimeNode,
	Title,
	Underline,
	Wavy,
	YoCard,
};