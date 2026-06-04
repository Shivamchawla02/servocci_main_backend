import CareerApplication from "../models/CareerApplication.js";
import sendEmail from "../utils/sendEmail.js";

export const submitCareerApplication = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      phone,
      position,
      experience,
      location,
      linkedin,
      coverLetter,
      resumeUrl,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !position ||
      !resumeUrl
    ) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const application =
      await CareerApplication.create({
        name,
        email,
        phone,
        position,
        experience,
        location,
        linkedin,
        coverLetter,
        resumeUrl,
      });

    // Admin Email

    await sendEmail(
      "hello@servocci.com",
      `New Career Application - ${position}`,
      `
      <h2>New Career Application</h2>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Position:</strong> ${position}</p>
      <p><strong>Experience:</strong> ${experience}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>LinkedIn:</strong> ${linkedin}</p>

      <p>
        <strong>Resume:</strong>
        <a href="${resumeUrl}">
          View Resume
        </a>
      </p>

      <hr/>

      <p>${coverLetter}</p>
      `
    );

    // Candidate Email

    await sendEmail(
      email,
      "Application Received - Servocci Counsellors",
      `
      <h2>Hello ${name},</h2>

      <p>
        Thank you for applying for the
        <strong>${position}</strong> role.
      </p>

      <p>
        Our recruitment team will review your
        application and contact you shortly.
      </p>

      <br/>

      <p>
        Regards,<br/>
        Team Servocci Counsellors
      </p>
      `
    );

    return res.status(201).json({
      success: true,
      message:
        "Application submitted successfully",
      application,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getCareerApplications =
  async (req, res) => {
    try {
      const applications =
        await CareerApplication.find().sort({
          createdAt: -1,
        });

      res.json({
        success: true,
        applications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  };