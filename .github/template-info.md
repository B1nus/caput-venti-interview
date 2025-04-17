# Template Repository Information

This file provides additional information about using this repository as a template.

## Template Features

- **Notification System**: When someone creates a repository from this template, an issue is automatically created to notify them about the template origin.
- **Private Development**: Users can create private repositories from this template, allowing them to work on their projects privately.
- **Collaboration Instructions**: The notification includes information about how to add the original owner as a collaborator if desired.

## How It Works

The `.github/workflows/add-owner.yml` file contains a GitHub Action that:

1. Runs when a new repository is created from this template
2. Creates an issue to notify the new repository owner about the template origin
3. Provides instructions for manually adding the original owner as a collaborator

## GitHub Permission Limitations

Due to GitHub's security restrictions, the default GitHub Actions token cannot automatically add collaborators to repositories. Instead, the workflow creates an issue with instructions on how to manually add the original owner as a collaborator if desired.

## Customization

If you're forking this template for your own use:

1. Update the `owner` variable in `.github/workflows/add-owner.yml` to your GitHub username
2. Modify the notification message if desired
3. Make sure to enable the template repository feature in your repository settings

## Privacy Considerations

- No automatic access is granted to the original template owner
- Repository owners have full control over who has access to their repository
- The workflow only creates a notification issue that can be closed or deleted 