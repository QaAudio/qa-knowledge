# Introducing Extensions SDK: An experimental playground inside Live

June 2, 2026

## ****Introducing Extensions SDK: An experimental playground inside Live****

The new Extensions Software Development Kit (SDK) is now in public beta.

Available as a free download, Extensions SDK is an open JavaScript toolkit allowing anyone to create custom tools that expand the possibilities inside Live 12 Suite.

[Visit the Extensions SDK page ›](https://www.ableton.com/live/extensions)

 ![](https://beta-ableton.imgix.net/media/doapp5jz/extensions-sdk_article_1280x1280.png?width=160&height=120&q=80&v=1dcef73d373c750&fit=crop&auto=compress,format&auto=compress,format&q=80&format=webp)

Menu

## **What are Extensions?**

Extensions are optional add-on tools that run alongside Live and can be accessed with a right-click from anywhere in your Set. They can read and edit the structure of your Set – including tracks, clips, parameters, automation and more.

Using the Extensions SDK, you can create tools that analyze, visualize, and reorganize your Live projects, automate the most repetitive parts of your process, spark or scramble ideas, and connect Live to entirely new services and systems. Some Extensions will help you move faster. Others might slow you down in just the right way.

![Blank placeholder image](https://i3.ytimg.com/vi/kzJFVI5CfzM/hqdefault.jpg)

## **How do I build them?**

Creating an Extension with the SDK is easy. Using familiar web technologies and shared ideas, it’s possible to go from a rough concept to a working tool quickly. Like making music, the results don’t need to be perfect to be interesting.

Learn how to start building your own Extensions in this introductory explainer video:

![Blank placeholder image](https://i3.ytimg.com/vi/LiXtOHsJZ6k/hqdefault.jpg)

[

Check out the Extensions SDK on GitHub for full instructions



](https://ableton.github.io/extensions-sdk "Link will open in a new window/tab")

## **Share and discover Extensions**

Take a look at [some early examples of what’s possible](https://www.ableton.com/en/live/extensions/#browse_extensions) to get inspiration for your own Extensions. [Ableton’s Discord Server](https://discord.com/invite/ableton) also welcomes community contributions, with a dedicated space for sharing, discussing and collaborating on Extensions.

If you’re a Live 12 Suite user and want to test out the tools, you’ll need to [join the beta program](https://www.ableton.com/en/beta/) and download Live version 12.4.5. Once you’re on the beta, you can install Extensions you’ve built or downloaded in Live’s settings.

## **Extensions SDK FAQs**

[What are Extensions?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_1)

Ableton Extensions, introduced in Live 12.4.5, provide a way for users to develop and use their own tools within Ableton Live using the Ableton Extensions SDK. 

Extensions can interact with tracks, clips, MIDI, devices, tempo, and other parts of a Live Set to automate tasks, transform musical data, and customize Live’s capabilities.

[In which versions and editions of Live are Extensions available?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_2)

Extensions are available in Live 12 Suite Beta, version 12.4.5 or later. Extensions are not available in Live Standard, Intro, or Lite.

[What can I do with Extensions?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_3)

Extensions can be programmed to affect tracks, clips, MIDI notes, devices, tempo and more. You can build Extensions to:

*   Transform MIDI
*   Analyze song and track structure
*   Automate repetitive tasks
*   Create unusual generative patterns
*   Connect to external services
*   Even play games in Live!

[How do I use Extensions in Live?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_4)

After you install an Extension in Live (via Settings → Extensions), here's how to access it:

*   Right-click an item in your Set (e.g. a MIDI clip, track, or other item).
*   Look in the context menu that appears.
*   If the Extension can be used on that item, it will show up there.
*   Click the name to run or edit the Extension.

After choosing it from the menu, a pop-up will appear in which you can alter the parameters of the Extension before running it. Triggering an extension causes it to run once, performing its task which returns a result or applies changes, then stop.

[What is needed to develop Extensions?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_5)

Developing with Extensions requires the following to be installed on your computer (macOS or Windows):

*   The [Ableton Extensions SDK](https://ableton.github.io/extensions-sdk)
*   [Node JS](https://nodejs.org/en/download) v24.16.0 (LTS)

[How do Extensions run inside Live?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_6)

Extensions are built on the NodeJS platform, a free, open-source, cross-platform JavaScript runtime environment. Extensions are triggered from the right-click context menu for the relevant item in your Set.

[Are Extensions safe?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_7)

The NodeJS platform is a separate framework outside Live, which enables a wide range of powerful technologies to integrate with Live. This ability also comes with the risk of third parties creating malicious Extensions with ill intent. As with any software you download from the internet, exercise caution and make sure you trust the source.

[How are Extensions different from Max for Live?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_8)

Max for Live is a deep creative patching environment offering synthesis, custom instruments and complex signal chains. Extensions are JavaScript-based tools that interact with the Set itself, affecting structure, data, and workflow.

[Do I need to be a developer to build an Extension?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_9)

The SDK is built on standard web technologies that AI coding assistants handle well. If you can clearly describe your idea for an Extension, you may be able to build a working Extension with AI assistance, without any coding experience.

[Where can I find more information about Extensions?](#collapse_520fdae3-01ef-4ab1-9806-096040d0361a_10)

Check out the documentation in the [Ableton Extensions SDK GitHub repository](https://ableton.github.io/extensions-sdk) for more information.
